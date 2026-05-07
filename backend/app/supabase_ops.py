from __future__ import annotations

import logging
from typing import Any

from .supabase_client import make_service_client

logger = logging.getLogger(__name__)


def _norm_host(s: str) -> str:
    return (s or "").strip().lower()


def _host_under_institution(hostname: str, inst_domain: str) -> bool:
    """
    hostname es el valor del navegador (ej. www.elp.edu.pe o aulavirtual.elp.edu.pe).
    inst_domain es la fila instituciones.domain (ej. elp.edu.pe).
    """
    h = _norm_host(hostname)
    d = _norm_host(inst_domain)
    if not h or not d:
        return False
    return h == d or h.endswith("." + d)


def lookup_institution_for_hostname(hostname: str) -> dict[str, Any] | None:
    """
    Resuelve institución cuando el cliente envía el hostname completo
    coincidiendo con el dominio base o cualquier subdominio registrado contra ese mismo base.
    """
    supabase = make_service_client()
    res = supabase.table("institutions").select("id, name, domain, status, subscription_end, plan").execute()
    rows = res.data or []
    h = _norm_host(hostname)
    if not h:
        return None
    best: tuple[int, dict[str, Any]] | None = None
    for row in rows:
        d = str(row.get("domain") or "")
        if not _host_under_institution(h, d):
            continue
        cand_len = len(_norm_host(d))
        if best is None or cand_len > best[0]:
            best = (cand_len, row)
    return best[1] if best else None


def resolve_institution_id(domain: str) -> str:
    row = lookup_institution_for_hostname(domain)
    if not row:
        raise ValueError("institution_not_found")
    return str(row["id"])


def upsert_user_profile(
    user_id: str,
    institution_id: str,
    email: str | None,
    name: str | None,
    disability_type: str | None,
) -> None:
    supabase = make_service_client()
    payload: dict[str, Any] = {
        "id": user_id,
        "institution_id": institution_id,
        "email": email,
        "name": name,
        "disability_type": disability_type,
    }
    (
        supabase.table("users")
        .upsert(payload, on_conflict="id")
        .execute()
    )


def upsert_user_preferences(
    user_id: str,
    contrast: int,
    font_size: int,
    font_family: str,
    line_spacing: int,
    color_mode: str,
) -> None:
    supabase = make_service_client()
    payload = {
        "user_id": user_id,
        "contrast": contrast,
        "font_size": font_size,
        "font_family": font_family,
        "line_spacing": line_spacing,
        "color_mode": color_mode,
    }
    (
        supabase.table("user_preferences")
        .upsert(payload, on_conflict="user_id")
        .execute()
    )


def insert_activity_log(
    user_id: str,
    event_type: str,
    domain: str | None,
    metadata: dict[str, Any],
) -> None:
    supabase = make_service_client()
    payload = {
        "user_id": user_id,
        "event_type": event_type,
        "domain": domain,
        "metadata": metadata,
    }
    supabase.table("activity_logs").insert(payload).execute()


def insert_compliance_log(
    institution_id: str,
    url: str,
    page_errors: list[str],
    corrections_applied: list[str],
    wcag_score: float,
    session_id: str | None,
) -> None:
    supabase = make_service_client()
    payload = {
        "institution_id": institution_id,
        "url": url,
        "page_errors": page_errors,
        "corrections_applied": corrections_applied,
        "wcag_score": wcag_score,
        "session_id": session_id,
    }
    supabase.table("compliance_logs").insert(payload).execute()


def get_institution_active(domain: str) -> bool:
    row = lookup_institution_for_hostname(domain)
    if not row:
        return False
    return row.get("status") == "active"


def get_admin_emails(institution_id: str) -> list[str]:
    """
    Devuelve emails del conjunto de admins (institution_admins).
    Nota: de momento usamos columna `users.email` (puede requerir descifrado si se implementa AES-256 real).
    """
    supabase = make_service_client()
    res = (
        supabase.table("institution_admins")
        .select("users(email)")
        .eq("institution_id", institution_id)
        .execute()
    )
    emails: list[str] = []
    for row in res.data or []:
        # forma aproximada; supabase-py puede retornar nested keys según config
        u = row.get("users") or {}
        email = u.get("email")
        if email:
            emails.append(email)
    return emails


def is_user_admin(institution_id: str, user_id: str) -> bool:
    supabase = make_service_client()
    res = (
        supabase.table("institution_admins")
        .select("user_id")
        .eq("institution_id", institution_id)
        .eq("user_id", user_id)
        .limit(1)
        .execute()
    )
    return bool(res.data)


def fetch_compliance_logs_for_period(
    institution_id: str,
    from_ts,
    to_ts,
):
    supabase = make_service_client()
    res = (
        supabase.table("compliance_logs")
        .select("url,wcag_score,page_errors,timestamp")
        .eq("institution_id", institution_id)
        .gte("timestamp", from_ts)
        .lte("timestamp", to_ts)
        .execute()
    )
    return res.data or []


def get_institution_by_domain(domain: str) -> dict[str, Any] | None:
    return lookup_institution_for_hostname(domain)


def list_active_institutions() -> list[dict[str, Any]]:
    supabase = make_service_client()
    res = (
        supabase.table("institutions")
        .select("id, name, domain, status, subscription_end, plan")
        .eq("status", "active")
        .execute()
    )
    rows = res.data or []
    if not rows:
        logger.warning(
            "Supabase devolvió 0 instituciones activas. Compruebe SUPABASE_URL (proyecto correcto) y "
            "SUPABASE_SERVICE_ROLE_KEY (debe ser la clave secreta «service_role», no la «anon»). "
            "Si usa anon por error, puede aplicar en Supabase el script rls_allow_anon_read_active_institutions.sql "
            "o la política equivalente en schema.sql."
        )
    return rows


def create_or_update_compliance_report(
    institution_id: str,
    period_start,
    period_end,
    pdf_url: str,
    score: float,
) -> None:
    supabase = make_service_client()
    payload = {
        "institution_id": institution_id,
        "period_start": period_start,
        "period_end": period_end,
        "pdf_url": pdf_url,
        "score": score,
    }
    # Insert simple: en MVP evitamos upsert complejo; se asume idempotencia del job por timestamp.
    supabase.table("compliance_reports").insert(payload).execute()

