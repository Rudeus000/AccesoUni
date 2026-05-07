from __future__ import annotations

import threading
from datetime import datetime, timedelta, timezone
from collections import Counter

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger

from ..config import get_settings
from ..email.smtp_mailer import send_report_email_smtp
from ..reporting.pdf_report import generate_compliance_pdf
from ..supabase_client import make_service_client
from ..supabase_ops import (
    fetch_compliance_logs_for_period,
    get_admin_emails,
    list_active_institutions,
)
from ..supabase_ops import create_or_update_compliance_report

_scheduler: BackgroundScheduler | None = None
_lock = threading.Lock()


def _last_month_range_utc(now: datetime):
    # periodo: primer día del mes anterior 00:00 UTC hasta último día anterior 23:59:59...
    first_this_month = datetime(now.year, now.month, 1, tzinfo=timezone.utc)
    last_month_end = first_this_month - timedelta(seconds=1)
    last_month_start = datetime(last_month_end.year, last_month_end.month, 1, tzinfo=timezone.utc)
    return last_month_start, last_month_end


def _compute_top_errors(logs):
    err_counter: Counter[str] = Counter()
    for l in logs:
        for e in l.get("page_errors") or []:
            err_counter[str(e)] += 1
    return err_counter.most_common(10)


def _monthly_job():
    settings = get_settings()
    service = make_service_client()
    now = datetime.now(timezone.utc)
    from_dt, to_dt = _last_month_range_utc(now)

    institutions = list_active_institutions()
    if not institutions:
        return

    for inst in institutions:
        institution_id = str(inst["id"])
        domain = str(inst.get("domain") or "")
        inst_name = str(inst.get("name") or "")

        logs = fetch_compliance_logs_for_period(institution_id, from_dt, to_dt)
        scores = [float(l.get("wcag_score") or 0) for l in logs] if logs else []
        avg_score = sum(scores) / max(len(scores), 1)
        top_errors = _compute_top_errors(logs) if logs else []

        pdf_bytes = generate_compliance_pdf(
            institution_name=inst_name,
            domain=domain,
            period_start=from_dt.date(),
            period_end=to_dt.date(),
            avg_score=avg_score,
            top_errors=top_errors,
        )

        filename = f"compliance_{institution_id}_{from_dt.date()}_{to_dt.date()}.pdf"
        storage_path = f"reports/{filename}"

        # Upload a Storage (puede requerir ajuste según API exacta de supabase-py)
        try:
            service.storage.from_(settings.storage_reports_bucket).upload(
                storage_path,
                pdf_bytes,
                {"contentType": "application/pdf"},
            )
        except Exception:
            # No rompemos el job si falla la subida; igual generamos el registro.
            pass

        # Construimos URL “directa” opcional (si tu bucket es público). Si no, usa signed URL en fase posterior.
        pdf_url = f"/storage/v1/object/public/{settings.storage_reports_bucket}/{storage_path}"

        # Guardar metadata del reporte
        create_or_update_compliance_report(
            institution_id=institution_id,
            period_start=from_dt.date(),
            period_end=to_dt.date(),
            pdf_url=pdf_url,
            score=avg_score,
        )

        # Enviar email (opcional en MVP si los emails están listos)
        recipients = get_admin_emails(institution_id)
        if recipients:
            try:
                send_report_email_smtp(
                    recipients,
                    subject=f"AccesoUni - Reporte mensual de cumplimiento ({from_dt.date()} - {to_dt.date()})",
                    body=(
                        f"Hola,\n\nAdjunto el reporte mensual de cumplimiento para {inst_name} "
                        f"({from_dt.date()} - {to_dt.date()}).\n\n"
                        f"Score WCAG promedio: {avg_score:.2f}\n\n"
                        "Saludos,\nAccesoUni"
                    ),
                    attachment=pdf_bytes,
                    attachment_filename=filename,
                )
            except Exception:
                # SMTP puede fallar si no se configura; no rompemos el job.
                pass


def start_monthly_report_job():
    global _scheduler
    if _scheduler is not None:
        return

    with _lock:
        if _scheduler is not None:
            return

        _scheduler = BackgroundScheduler(timezone="UTC")
        # Primer día de cada mes a las 00:00 UTC
        _scheduler.add_job(
            _monthly_job,
            trigger=CronTrigger(day=1, hour=0, minute=0, second=0),
        )
        _scheduler.start()

