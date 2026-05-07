from __future__ import annotations

from fastapi import APIRouter

from ..supabase_ops import list_active_institutions

router = APIRouter()


@router.get("/public/allowed-domains")
def get_allowed_institution_domains() -> dict:
    """
    Lista los dominios apex de instituciones con estado «active».
    La extensión usa esto para registrar el content script solo en esos hosts
    (y subdominios), alineado con `lookup_institution_for_hostname` en el backend.
    """
    rows = list_active_institutions()
    domains = sorted(
        {
            str(r.get("domain") or "").strip().lower()
            for r in rows
            if str(r.get("domain") or "").strip()
        }
    )
    return {"domains": domains}
