from __future__ import annotations

import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.audit import router as audit_router
from .routes.extension_login import router as extension_login_router
from .routes.preferences import router as preferences_router
from .routes.public_site import router as public_site_router
from .routes.reports import router as reports_router
from .jobs.monthly_reports import start_monthly_report_job


def create_app() -> FastAPI:
    app = FastAPI(title="AccesoUni API", version="0.1.0")

    # Para el dashboard / extensión local en desarrollo
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(preferences_router, prefix="/api/v1", tags=["preferences"])
    app.include_router(audit_router, prefix="/api/v1", tags=["audit"])
    app.include_router(public_site_router, prefix="/api/v1", tags=["public"])
    app.include_router(extension_login_router, tags=["extension"])
    app.include_router(reports_router, prefix="/api/v1", tags=["reports"])

    @app.on_event("startup")
    async def _startup() -> None:
        # Start idempotente del job mensual (internamente maneja que no se duplique).
        start_monthly_report_job()
        await asyncio.sleep(0)

    return app


app = create_app()

