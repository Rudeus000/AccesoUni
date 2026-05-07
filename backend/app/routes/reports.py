from __future__ import annotations

from datetime import datetime, time, timezone
from collections import Counter

from fastapi import APIRouter, Depends, HTTPException, Query

from ..config import get_settings
from ..reporting.pdf_report import generate_compliance_pdf
from ..security.auth import get_current_user
from ..supabase_client import make_service_client
from ..supabase_ops import (
    fetch_compliance_logs_for_period,
    get_admin_emails,
    get_institution_by_domain,
    is_user_admin,
)

router = APIRouter()


@router.get("/reports/compliance")
def compliance_report(
    domain: str = Query(...),
    from_ts: str = Query(..., description="ISO 8601 date or datetime (UTC preferible)"),
    to_ts: str = Query(..., description="ISO 8601 date or datetime (UTC preferible)"),
    current_user=Depends(get_current_user),
):
    """
    Genera métricas y (en MVP) exporta un PDF a Supabase Storage.
    """
    settings = get_settings()
    inst = get_institution_by_domain(domain)
    if not inst:
        raise HTTPException(status_code=404, detail="institution_not_found_for_domain")

    user_obj = getattr(current_user, "user", current_user)
    user_id = str(user_obj.id)

    if not is_user_admin(inst["id"], user_id):
        raise HTTPException(status_code=403, detail="not_institution_admin")

    def _parse(ts: str) -> datetime:
        # Soporta YYYY-MM-DD (date) o ISO datetime
        try:
            if len(ts) == 10:
                dt = datetime.fromisoformat(ts)  # date -> datetime(YYYY-MM-DDT00:00:00)
                return datetime.combine(dt.date(), time.min, tzinfo=timezone.utc)
            dt = datetime.fromisoformat(ts)
            if dt.tzinfo is None:
                return dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            raise HTTPException(status_code=400, detail="invalid_from_ts_or_to_ts")

    from_dt = _parse(from_ts)
    to_dt = _parse(to_ts)

    logs = fetch_compliance_logs_for_period(inst["id"], from_dt, to_dt)
    if not logs:
        return {
            "ok": True,
            "avg_score": 0,
            "top_errors": [],
            "pdf_url": None,
            "count": 0,
        }

    scores = [float(l.get("wcag_score") or 0) for l in logs]
    avg_score = sum(scores) / max(len(scores), 1)

    # Flatten errors
    err_counter: Counter[str] = Counter()
    for l in logs:
        for e in l.get("page_errors") or []:
            err_counter[str(e)] += 1
    top_errors = err_counter.most_common(10)

    pdf_bytes = generate_compliance_pdf(
        institution_name=str(inst.get("name") or ""),
        domain=domain,
        period_start=from_dt.date(),
        period_end=to_dt.date(),
        avg_score=avg_score,
        top_errors=top_errors,
    )

    # Upload a Storage
    service = make_service_client()
    filename = f"compliance_{inst['id']}_{from_dt.date()}_{to_dt.date()}.pdf"
    storage_path = f"reports/{filename}"

    # Nota: supabase-py storage API puede variar entre versiones.
    # En caso de que el método exacto difiera, ajustaremos este bloque.
    service.storage.from_(settings.storage_reports_bucket).upload(
        storage_path,
        pdf_bytes,
        {"contentType": "application/pdf"},
    )

    # Crear una URL firmada (opcional). Si tu bucket es público, se puede construir una URL directa.
    try:
        signed = service.storage.from_(settings.storage_reports_bucket).create_signed_url(
            storage_path,
            expires_in=60 * 60 * 24 * 30,
        )
        pdf_url = signed.get("signedURL") or signed.get("url")
    except Exception:
        pdf_url = None

    return {
        "ok": True,
        "avg_score": avg_score,
        "top_errors": [{"error": e, "count": c} for e, c in top_errors],
        "pdf_url": pdf_url,
        "count": len(logs),
    }

