import os
import io
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

from backend.app.models.trip import Trip, TripMember
from backend.app.models.itinerary import ItineraryDay, ItineraryItem
from backend.app.models.flight import Flight
from backend.app.models.expense import Expense
from backend.app.models.user import User

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_footer(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        # Footer line
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(40, 40, letter[0] - 40, 40)
        # Footer text
        footer_text = "ARC-NOMADE — Your Journey, Perfectly Mapped."
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawString(40, 26, footer_text)
        self.drawRightString(letter[0] - 40, 26, page_text)
        self.restoreState()

class PDFExportService:
    @staticmethod
    def generate_trip_itinerary_pdf(db: Session, trip_id: str) -> io.BytesIO:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValueError("Trip not found")

        members = db.query(TripMember).filter(TripMember.trip_id == trip_id).all()
        days = db.query(ItineraryDay).filter(ItineraryDay.trip_id == trip_id).order_by(ItineraryDay.day_number).all()
        flights = db.query(Flight).filter(Flight.trip_id == trip_id).order_by(Flight.departure_time).all()
        expenses = db.query(Expense).filter(Expense.trip_id == trip_id).all()

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=50
        )

        styles = getSampleStyleSheet()
        
        # Custom palette
        PRIMARY = colors.HexColor("#4F46E5")   # Indigo
        SECONDARY = colors.HexColor("#0F172A") # Deep slate
        MUTED = colors.HexColor("#64748B")     # Slate grey
        ACCENT = colors.HexColor("#06B6D4")    # Cyan
        LIGHT_BG = colors.HexColor("#F8FAFC")
        CARD_BG = colors.HexColor("#EEF2F6")

        # Custom Typography styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            textColor=PRIMARY,
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            "DocSubtitle",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=12,
            leading=16,
            textColor=MUTED,
            spaceAfter=12
        )
        h1_style = ParagraphStyle(
            "Heading1_Custom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=15,
            leading=19,
            textColor=SECONDARY,
            spaceBefore=14,
            spaceAfter=8
        )
        h2_style = ParagraphStyle(
            "Heading2_Custom",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            textColor=PRIMARY,
            spaceBefore=8,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            "Body_Custom",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=SECONDARY
        )
        body_muted = ParagraphStyle(
            "BodyMuted",
            parent=body_style,
            textColor=MUTED,
            fontSize=8.5,
            leading=11
        )
        badge_style = ParagraphStyle(
            "BadgeStyle",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=colors.white
        )

        elements = []

        # Header Block
        elements.append(Paragraph("ARC-NOMADE 🧭", ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=14, textColor=PRIMARY)))
        elements.append(Paragraph(trip.title, title_style))
        dest_dates = f"<b>Destination:</b> {trip.destination} &nbsp;|&nbsp; <b>Dates:</b> {trip.start_date.strftime('%b %d, %Y')} — {trip.end_date.strftime('%b %d, %Y')} &nbsp;|&nbsp; <b>Status:</b> {trip.status}"
        elements.append(Paragraph(dest_dates, subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=14))

        # Overview Metadata Card Table
        owner_name = trip.owner.full_name if trip.owner else "Trip Leader"
        member_names = ", ".join([m.user.full_name for m in members if m.user]) or "Solo Explorer"
        total_spent = sum([e.amount for e in expenses], 0)
        
        info_data = [
            [
                Paragraph("<b>Trip Leader:</b>", body_muted), Paragraph(owner_name, body_style),
                Paragraph("<b>Total Budget:</b>", body_muted), Paragraph(f"{trip.currency} {trip.budget:,.2f}", body_style)
            ],
            [
                Paragraph("<b>Travelers:</b>", body_muted), Paragraph(member_names, body_style),
                Paragraph("<b>Tracked Expenses:</b>", body_muted), Paragraph(f"{trip.currency} {total_spent:,.2f}", body_style)
            ]
        ]
        info_table = Table(info_data, colWidths=[90, 180, 95, 165])
        info_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), LIGHT_BG),
            ("PADDING", (0, 0), (-1, -1), 6),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#F1F5F9")),
        ]))
        elements.append(info_table)
        elements.append(Spacer(1, 14))

        # Flights Section (if any)
        if flights:
            elements.append(Paragraph("✈️ Flight Itinerary", h1_style))
            flight_data = [
                [
                    Paragraph("<b>Flight</b>", body_style),
                    Paragraph("<b>Route</b>", body_style),
                    Paragraph("<b>Departure</b>", body_style),
                    Paragraph("<b>Arrival</b>", body_style),
                    Paragraph("<b>Gate / Terminal</b>", body_style),
                    Paragraph("<b>Status</b>", body_style)
                ]
            ]
            for f in flights:
                route_str = f"{f.departure_airport} → {f.arrival_airport}"
                dep_str = f.departure_time.strftime("%b %d, %H:%M")
                arr_str = f.arrival_time.strftime("%b %d, %H:%M")
                gate_str = f"T: {f.terminal or '-'} | G: {f.gate or '-'}"
                flight_data.append([
                    Paragraph(f"<b>{f.airline}</b><br/>{f.flight_number}", body_style),
                    Paragraph(route_str, body_style),
                    Paragraph(dep_str, body_style),
                    Paragraph(arr_str, body_style),
                    Paragraph(gate_str, body_style),
                    Paragraph(f"<b>{f.status}</b>", body_style)
                ])

            flight_table = Table(flight_data, colWidths=[90, 90, 95, 95, 85, 75])
            flight_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), CARD_BG),
                ("PADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]))
            elements.append(flight_table)
            elements.append(Spacer(1, 14))

        # Day-by-Day Itinerary Section
        elements.append(Paragraph("📅 Day-by-Day Journey Schedule", h1_style))
        if not days:
            elements.append(Paragraph("<i>No itinerary items planned yet. Use ARC-NOMADE AI Planner to generate.</i>", body_muted))
        else:
            for day in days:
                day_title = f"Day {day.day_number}"
                if day.date:
                    day_title += f" &nbsp;—&nbsp; {day.date.strftime('%A, %B %d, %Y')}"
                elements.append(Paragraph(day_title, h2_style))
                if day.notes:
                    elements.append(Paragraph(f"<i>{day.notes}</i>", body_muted))
                
                if not day.items:
                    elements.append(Paragraph("<i>Open day for spontaneous leisure & local discovery.</i>", body_muted))
                    elements.append(Spacer(1, 6))
                    continue

                item_data = [
                    [
                        Paragraph("<b>Time</b>", body_style),
                        Paragraph("<b>Activity & Description</b>", body_style),
                        Paragraph("<b>Location / Address</b>", body_style),
                        Paragraph("<b>Category</b>", body_style),
                        Paragraph("<b>Est. Cost</b>", body_style)
                    ]
                ]

                for item in day.items:
                    time_str = f"{item.start_time or ''} - {item.end_time or ''}".strip(" -") or "Flexible"
                    desc_text = f"<b>{item.title}</b>"
                    if item.description:
                        desc_text += f"<br/><font color='#64748B'>{item.description}</font>"
                    if item.notes:
                        desc_text += f"<br/><i><font color='#0284C7'>Tip: {item.notes}</font></i>"

                    loc_text = item.location_name or "-"
                    if item.address:
                        loc_text += f"<br/><font color='#94A3B8'>{item.address}</font>"

                    cost_text = f"{item.currency} {item.estimated_cost:,.2f}" if item.estimated_cost > 0 else "Free"

                    item_data.append([
                        Paragraph(time_str, body_style),
                        Paragraph(desc_text, body_style),
                        Paragraph(loc_text, body_style),
                        Paragraph(item.category, body_style),
                        Paragraph(cost_text, body_style)
                    ])

                item_table = Table(item_data, colWidths=[70, 200, 130, 70, 60])
                item_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BG),
                    ("PADDING", (0, 0), (-1, -1), 5),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
                ]))
                elements.append(item_table)
                elements.append(Spacer(1, 10))

        # Expense Summary Section
        if expenses:
            elements.append(Spacer(1, 8))
            elements.append(Paragraph("💳 Expense Overview", h1_style))
            exp_data = [
                [
                    Paragraph("<b>Date</b>", body_style),
                    Paragraph("<b>Description</b>", body_style),
                    Paragraph("<b>Category</b>", body_style),
                    Paragraph("<b>Paid By</b>", body_style),
                    Paragraph("<b>Amount</b>", body_style)
                ]
            ]
            for exp in expenses[:8]:
                exp_data.append([
                    Paragraph(exp.expense_date.strftime("%b %d"), body_style),
                    Paragraph(exp.description, body_style),
                    Paragraph(exp.category, body_style),
                    Paragraph(exp.payer.full_name if exp.payer else "Member", body_style),
                    Paragraph(f"{exp.currency} {exp.amount:,.2f}", body_style)
                ])

            exp_table = Table(exp_data, colWidths=[70, 190, 90, 100, 80])
            exp_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), CARD_BG),
                ("PADDING", (0, 0), (-1, -1), 4.5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
            ]))
            elements.append(exp_table)

        doc.build(elements, canvasmaker=NumberedCanvas)
        buffer.seek(0)
        return buffer

pdf_export_service = PDFExportService()
