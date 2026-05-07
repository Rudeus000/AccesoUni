from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Iterable

from ..config import get_settings


def send_report_email_smtp(
    recipients: Iterable[str],
    *,
    subject: str,
    body: str,
    attachment: bytes | None = None,
    attachment_filename: str | None = None,
) -> None:
    s = get_settings()

    msg = EmailMessage()
    msg["From"] = s.mail_from
    msg["To"] = ", ".join(list(recipients))
    msg["Subject"] = subject
    msg.set_content(body)

    if attachment is not None and attachment_filename:
        msg.add_attachment(
            attachment,
            maintype="application",
            subtype="pdf",
            filename=attachment_filename,
        )

    with smtplib.SMTP(s.mail_host, s.mail_port) as server:
        server.starttls()
        server.login(s.mail_user, s.mail_pass)
        server.send_message(msg)

