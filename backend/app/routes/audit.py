from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..security.auth import get_current_user
from ..supabase_ops import (
    get_institution_active,
    insert_activity_log,
    insert_compliance_log,
    resolve_institution_id,
)

router = APIRouter()


class ScanIn(BaseModel):
    domain: str
    url: str
    errors_detected: List[str] = Field(default_factory=list)
    corrections_applied: List[str] = Field(default_factory=list)
    wcag_score: float = Field(ge=0, le=100, default=0)
    session_id: Optional[str] = None


@router.post("/audit/scan")
def submit_scan(payload: ScanIn, current_user=Depends(get_current_user)):
    """
    Inserta un registro en compliance_logs y (opcionalmente) activity_logs.
    """
    if not get_institution_active(payload.domain):
        raise HTTPException(status_code=403, detail="institution_not_active_or_not_registered")

    user_obj = getattr(current_user, "user", current_user)
    user_id = str(user_obj.id)

    try:
        institution_id = resolve_institution_id(payload.domain)
    except ValueError:
        raise HTTPException(status_code=404, detail="institution_not_found_for_domain")

    insert_compliance_log(
        institution_id=institution_id,
        url=payload.url,
        page_errors=payload.errors_detected,
        corrections_applied=payload.corrections_applied,
        wcag_score=payload.wcag_score,
        session_id=payload.session_id,
    )

    insert_activity_log(
        user_id=user_id,
        event_type="scan_submitted",
        domain=payload.domain,
        metadata={
            "url": payload.url,
            "wcag_score": payload.wcag_score,
            "errors_count": len(payload.errors_detected),
            "corrections_count": len(payload.corrections_applied),
        },
    )

    return {"ok": True}

