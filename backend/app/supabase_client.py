from __future__ import annotations

from supabase import Client, create_client

from .config import get_settings


def make_service_client() -> Client:
    s = get_settings()
    return create_client(s.supabase_url, s.supabase_service_role_key)

