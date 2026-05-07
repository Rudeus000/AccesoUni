from __future__ import annotations

import io
from collections import Counter

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib import colors


def generate_compliance_pdf(
    *,
    institution_name: str,
    domain: str,
    period_start,
    period_end,
    avg_score: float,
    top_errors: list[tuple[str, int]],
) -> bytes:
    """
    PDF simple con métricas y “top errores”.
    (En fases siguientes se agregan gráficas, sello y firma digital.)
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=36, leftMargin=36, topMargin=54, bottomMargin=54)
    styles = getSampleStyleSheet()

    story = []
    story.append(Paragraph("AccesoUni - Reporte de Cumplimiento (MVP)", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>Institución:</b> {institution_name or '-'}", styles["Normal"]))
    story.append(Paragraph(f"<b>Dominio:</b> {domain}", styles["Normal"]))
    story.append(Paragraph(f"<b>Periodo:</b> {period_start} - {period_end}", styles["Normal"]))
    story.append(Paragraph(f"<b>Score WCAG (promedio):</b> {avg_score:.2f}", styles["Normal"]))
    story.append(Spacer(1, 18))

    story.append(Paragraph("Top errores detectados (por ocurrencias):", styles["Heading2"]))
    story.append(Spacer(1, 8))

    data = [["Error", "Ocurrencias"]]
    for err, count in top_errors[:10]:
        data.append([err, str(count)])

    t = Table(data, colWidths=[360, 120])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    story.append(t)
    doc.build(story)
    return buffer.getvalue()

