from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parent.parent / ".env")


class Settings(BaseModel):
    supabase_url: str
    supabase_service_role_key: str

    api_host: str = "0.0.0.0"
    api_port: int = 8000

    mail_host: str
    mail_port: int = 587
    mail_user: str
    mail_pass: str
    mail_from: str

    data_enc_key: str | None = None
    storage_reports_bucket: str = "compliance-reports"


def get_settings() -> Settings:
    return Settings(
        supabase_url=os.environ["SUPABASE_URL"],
        supabase_service_role_key=os.environ["SUPABASE_SERVICE_ROLE_KEY"],
        api_host=os.getenv("API_HOST", "0.0.0.0"),
        api_port=int(os.getenv("API_PORT", "8000")),
        mail_host=os.getenv("MAIL_HOST", ""),
        mail_port=int(os.getenv("MAIL_PORT", "587")),
        mail_user=os.getenv("MAIL_USER", ""),
        mail_pass=os.getenv("MAIL_PASS", ""),
        mail_from=os.getenv("MAIL_FROM", ""),
        data_enc_key=os.getenv("DATA_ENC_KEY", None) or None,
        storage_reports_bucket=os.getenv("STORAGE_REPORTS_BUCKET", "compliance-reports"),
    )

