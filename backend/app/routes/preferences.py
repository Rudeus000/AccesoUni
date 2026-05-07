from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..security.auth import get_current_user
from ..supabase_ops import (
    get_institution_active,
    insert_activity_log,
    resolve_institution_id,
    upsert_user_preferences,
    upsert_user_profile,
)

router = APIRouter()


class PreferencesIn(BaseModel):
    domain: str
    contrast: int = Field(ge=50, le=200, default=100)
    font_size: int = Field(ge=80, le=200, default=100)
    font_family: str = Field(default="default")
    line_spacing: int = Field(ge=80, le=200, default=100)
    color_mode: str = Field(default="auto")
    disability_type: Optional[str] = None
    name: Optional[str] = None


@router.put("/preferences")
def save_preferences(payload: PreferencesIn, current_user=Depends(get_current_user)):
    """
    Guarda preferencias en nube (user_preferences) y asegura el perfil (users).
    """
    if not get_institution_active(payload.domain):
        # En MVP devolvemos 403 para que el content script no “habilite” premium.
        raise HTTPException(status_code=403, detail="institution_not_active_or_not_registered")

    # Supabase-py estructura del usuario: response.user.id y response.user.email, etc.
    user_obj = getattr(current_user, "user", current_user)
    user_id = str(user_obj.id)
    email = getattr(user_obj, "email", None)
    name = payload.name or getattr(user_obj, "user_metadata", {}).get("full_name")

    try:
        institution_id = resolve_institution_id(payload.domain)
    except ValueError:
        raise HTTPException(status_code=404, detail="institution_not_found_for_domain")

    # Perfil + preferencias
    upsert_user_profile(
        user_id=user_id,
        institution_id=institution_id,
        email=email,
        name=name,
        disability_type=payload.disability_type,
    )
    upsert_user_preferences(
        user_id=user_id,
        contrast=payload.contrast,
        font_size=payload.font_size,
        font_family=payload.font_family,
        line_spacing=payload.line_spacing,
        color_mode=payload.color_mode,
    )

    # Registro de actividad para auditoría/debug.
    insert_activity_log(
        user_id=user_id,
        event_type="preferences_saved",
        domain=payload.domain,
        metadata={
            "contrast": payload.contrast,
            "font_size": payload.font_size,
            "font_family": payload.font_family,
            "line_spacing": payload.line_spacing,
            "color_mode": payload.color_mode,
        },
    )

    return {"ok": True}

