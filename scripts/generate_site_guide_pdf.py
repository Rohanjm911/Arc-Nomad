"""
ARC-NOMADE: "How The Site Works" PDF User Manual Generator
Generates a publication-quality, styled multi-page PDF document using ReportLab.
Run: python scripts/generate_site_guide_pdf.py
Output: arc_nomade_how_the_site_works.pdf
"""

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
    PageBreak,
    HRFlowable,
)
from reportlab.pdfgen import canvas


class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and draw total page count and header."""

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
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            # Skip running header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B"))

        # Running Top Header
        self.drawString(
            36,
            756,
            "ARC-NOMADE 🧭✈️  |  Official Platform User Guide & Walkthrough",
        )
        self.setStrokeColor(colors.HexColor("#334155"))
        self.setLineWidth(0.5)
        self.line(36, 750, 576, 750)

        # Running Bottom Footer
        self.line(36, 38, 576, 38)
        self.setFont("Helvetica", 8)
        self.drawString(
            36,
            26,
            "ARC-NOMADE — AI-Powered Collaborative Travel Planning & Expedition Platform",
        )
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(576, 26, page_text)
        self.restoreState()


def generate_guide_pdf(output_path="arc_nomade_how_the_site_works.pdf"):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54,
    )

    # Color Palette
    PRIMARY = colors.HexColor("#3B82F6")     # Blue
    SECONDARY = colors.HexColor("#06B6D4")   # Cyan
    ACCENT = colors.HexColor("#8B5CF6")      # Purple
    DARK_BG = colors.HexColor("#0F172A")     # Slate 900
    CARD_BG = colors.HexColor("#1E293B")     # Slate 800
    ROW_ALT = colors.HexColor("#162032")     # Alternating table row
    TEXT_LIGHT = colors.HexColor("#F8FAFC")
    TEXT_MUTED = colors.HexColor("#94A3B8")
    BORDER_CLR = colors.HexColor("#334155")
    SUCCESS = colors.HexColor("#10B981")     # Emerald

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=28,
        leading=34,
        textColor=TEXT_LIGHT,
        alignment=0,
    )
    subtitle_style = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=SECONDARY,
        alignment=0,
    )
    h1_style = ParagraphStyle(
        "SectionHeading1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=TEXT_LIGHT,
        spaceAfter=6,
    )
    h2_style = ParagraphStyle(
        "SectionHeading2",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=4,
    )
    body_style = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_MUTED,
        spaceAfter=6,
    )
    body_bold = ParagraphStyle(
        "BodyDarkBold",
        parent=body_style,
        fontName="Helvetica-Bold",
        textColor=TEXT_LIGHT,
    )
    bullet_style = ParagraphStyle(
        "BulletDark",
        parent=body_style,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=3,
    )
    code_style = ParagraphStyle(
        "CodeText",
        parent=styles["Normal"],
        fontName="Courier",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#38BDF8"),
    )

    story = []

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(
        Paragraph("🧭✈️ ARC-NOMADE", title_style)
    )
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "HOW THE SITE WORKS — End-to-End Traveler & Expedition Guide",
            subtitle_style,
        )
    )
    story.append(Spacer(1, 10))

    tagline_table = Table(
        [[
            Paragraph(
                "<b>Your Journey, Perfectly Mapped.</b> Unified AI Itinerary Architecture, Live CARTO Cartography, 80+ Multi-Currency Engine with Country Flags, Circular Debt Simplification, Live Flight State Machines & Real-Time Collaboration.",
                body_style,
            )
        ]],
        colWidths=[540],
    )
    tagline_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#3B82F6")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ])
    )
    story.append(tagline_table)
    story.append(Spacer(1, 14))

    # Metadata Card
    meta_data = [
        [
            Paragraph("<b>Target Audience:</b> Solo Nomads, Travel Groups, Expedition Leaders", body_style),
            Paragraph("<b>Version:</b> 1.0 Production-Ready", body_style),
        ],
        [
            Paragraph("<b>Stack:</b> Next.js 16 (Turbopack), FastAPI, Leaflet, ReportLab", body_style),
            Paragraph("<b>AI Engine:</b> OpenRouter & Gemini Dual-Provider", body_style),
        ],
        [
            Paragraph("<b>Currencies Supported:</b> 80+ Global Currencies with National Flags", body_style),
            Paragraph("<b>Cartography:</b> CARTO Dark Matter & Voyager, Satellite", body_style),
        ],
    ]
    meta_table = Table(meta_data, colWidths=[270, 270])
    meta_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#131D2E")),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ])
    )
    story.append(meta_table)
    story.append(Spacer(1, 16))

    # =========================================================================
    # CHAPTER 1: PLATFORM OVERVIEW & WORKFLOW FLOWCHART
    # =========================================================================
    story.append(Paragraph("1. Platform Overview & The 5-Stage Nomad Lifecycle", h1_style))
    story.append(
        Paragraph(
            "ARC-NOMADE replaces chaotic spreadsheets, disconnected chat threads, and currency confusion abroad with a single unified platform. The expedition lifecycle flows through five intuitive stages:",
            body_style,
        )
    )

    lifecycle_data = [
        [
            Paragraph("<b>Stage</b>", body_bold),
            Paragraph("<b>Phase Name</b>", body_bold),
            Paragraph("<b>Key User Actions & Technologies</b>", body_bold),
        ],
        [
            Paragraph("<font color='#38BDF8'><b>Phase 1</b></font>", body_style),
            Paragraph("<b>Account & Preferences</b>", body_style),
            Paragraph("Set home airport, travel persona, budget tier, and preferred default currency from 80+ options with country flags.", body_style),
        ],
        [
            Paragraph("<font color='#38BDF8'><b>Phase 2</b></font>", body_style),
            Paragraph("<b>Creation Wizard</b>", body_style),
            Paragraph("4-step flow: Live geocoding pin-drop, date calculation, dynamic budget currency picker, and AI Travel Architect toggle.", body_style),
        ],
        [
            Paragraph("<font color='#38BDF8'><b>Phase 3</b></font>", body_style),
            Paragraph("<b>Command Center</b>", body_style),
            Paragraph("Unified trip dashboard with 5-day weather forecast, multi-tab agendas, CARTO map switcher, and live member presence.", body_style),
        ],
        [
            Paragraph("<font color='#38BDF8'><b>Phase 4</b></font>", body_style),
            Paragraph("<b>Expedition Operations</b>", body_style),
            Paragraph("Live flight state tracking, multi-currency conversion abroad, and automated circular debt simplification.", body_style),
        ],
        [
            Paragraph("<font color='#38BDF8'><b>Phase 5</b></font>", body_style),
            Paragraph("<b>Dossier Archival</b>", body_style),
            Paragraph("1-click exports: Executive 6-sheet Excel workbook with formulas and styled print-ready PDF travel dossiers.", body_style),
        ],
    ]
    lc_table = Table(lifecycle_data, colWidths=[65, 135, 340])
    lc_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1E293B")),
            ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#0B132B")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0F172A"), ROW_ALT]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(lc_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 2: USER PROFILE & ONBOARDING
    # =========================================================================
    story.append(Paragraph("2. Onboarding & Personalizing Your Travel Persona", h1_style))
    story.append(
        Paragraph(
            "Every traveler approaches expeditions differently. ARC-NOMADE tailors AI recommendations and default values based on your user profile (<code>/profile</code>):",
            body_style,
        )
    )

    profile_bullets = [
        "<b>Home Airport Code:</b> Configure standard 3-letter IATA codes (e.g., HND, JFK, LHR, CDG, SIN) to pre-populate flight routing.",
        "<b>Travel Personas:</b> Choose from <i>Balanced Explorer</i>, <i>Cultural Connoisseur</i>, <i>Foodie & Dining</i>, <i>Active & Outdoors</i>, or <i>Slow & Relaxed</i>.",
        "<b>Preferred Currency:</b> Select your domestic currency using the searchable <code>CurrencySelect</code> dropdown featuring 80+ currencies with national flags.",
        "<b>Budget Tier:</b> Tag your preference ($ Budget Conscious, $$ Moderate Comfort, $$$ High-End Luxury) to guide AI cost estimation.",
    ]
    for pb in profile_bullets:
        story.append(Paragraph(f"• {pb}", bullet_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 3: THE 4-STEP TRIP CREATION WIZARD
    # =========================================================================
    story.append(PageBreak())  # Clean break to Page 2
    story.append(Paragraph("3. The 4-Step Expedition Creation Wizard (/trips/create)", h1_style))
    story.append(
        Paragraph(
            "Creating an expedition takes under 60 seconds with real-time feedback at every step:",
            body_style,
        )
    )

    wizard_steps = [
        [
            Paragraph("<b>Step</b>", body_bold),
            Paragraph("<b>Feature & Capability</b>", body_bold),
            Paragraph("<b>What Happens Behind the Scenes</b>", body_bold),
        ],
        [
            Paragraph("<font color='#06B6D4'><b>Step 1</b></font>", body_style),
            Paragraph("<b>Destination & Live Geocoding</b>", body_style),
            Paragraph("Type any city or region (e.g. 'Kyoto, Japan'). Open-Meteo geocodes coordinates, and the interactive map preview automatically flies to the city and pins the exact location.", body_style),
        ],
        [
            Paragraph("<font color='#06B6D4'><b>Step 2</b></font>", body_style),
            Paragraph("<b>Dates & Scenic Cover Photo</b>", body_style),
            Paragraph("Pick start and end dates. Duration in days is computed automatically. Choose a curated scenic preset photo or provide a custom Unsplash cover URL.", body_style),
        ],
        [
            Paragraph("<font color='#06B6D4'><b>Step 3</b></font>", body_style),
            Paragraph("<b>Budget, 80+ Currencies & AI Architect</b>", body_style),
            Paragraph("Input Total Budget with dynamic currency prefix ($ / € / £ / ¥ / ₹ / etc.). Choose Primary Currency from 80+ countries with national flags. Toggle AI Travel Architect with desired daily pace.", body_style),
        ],
        [
            Paragraph("<font color='#06B6D4'><b>Step 4</b></font>", body_style),
            Paragraph("<b>Review & Launch Expedition</b>", body_style),
            Paragraph("Review summary card with spatial coordinates, duration, and country-flagged budget. Click 'Launch Expedition' for seamless navigation to the trip workspace.", body_style),
        ],
    ]
    wiz_table = Table(wizard_steps, colWidths=[55, 170, 315])
    wiz_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), CARD_BG),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0F172A"), ROW_ALT]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(wiz_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 4: DAY-BY-DAY ITINERARY & AI ARCHITECT
    # =========================================================================
    story.append(Paragraph("4. Day-by-Day Itinerary Planner & Dual AI Architect", h1_style))
    story.append(
        Paragraph(
            "The Itinerary Planner structures your journey chronologically with rich multimedia cards:",
            body_style,
        )
    )

    itin_points = [
        "<b>Day-by-Day Agenda:</b> Grouped into expandable day cards with calendar date references and daily estimated cost subtotals.",
        "<b>Rich Item Details:</b> Each stop includes title, category (Sightseeing, Culinary, Transport, Accommodation, Activity, Relaxation), start/end time, physical address, and notes.",
        "<b>Dual AI Engine (OpenRouter & Gemini):</b> Click 'Generate with AI' to trigger automated itinerary synthesis. OpenRouter uses <code>google/gemini-2.5-flash</code> (with fallback to <code>gpt-4o-mini</code>) and a 4,500 token budget to output complete timetables with geocoded stop coordinates.",
    ]
    for ip in itin_points:
        story.append(Paragraph(f"• {ip}", bullet_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 5: INTERACTIVE CARTOGRAPHY & CARTO BASEMAP SWITCHER
    # =========================================================================
    story.append(Paragraph("5. Interactive Spatial Cartography & CARTO Basemaps", h1_style))
    story.append(
        Paragraph(
            "The interactive Leaflet mapping engine visualizes every stop and route in real time:",
            body_style,
        )
    )

    map_points = [
        "<b>Dual Pin Indicator:</b> Scheduled itinerary items render as illuminated <b>Cyan markers</b>; local AI-recommended discoveries render as <b>Purple markers</b>.",
        "<b>Connected Route Polylines:</b> Automatic route vectors link sequential stops throughout the day so travelers visualize travel order.",
        "<b>Live Basemap Switcher:</b> Switch between <b>CARTO Dark Matter</b> (sleek dark mode), <b>CARTO Voyager</b> (high-visibility explorer road map), <b>OpenStreetMap Standard</b>, and <b>Esri Satellite</b>.",
        "<b>Zero-Watermark Delivery:</b> Authenticated tile requests pass <code>?key=CARTO_KEY</code> for crystal-clear cartographic display.",
        "<b>Performance Memoization:</b> Guarded by <code>locationsRef</code> and memoized position watchers to eliminate React re-render loops.",
    ]
    for mp in map_points:
        story.append(Paragraph(f"• {mp}", bullet_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 6: 80+ MULTI-CURRENCY CALCULATOR & NOMAD CHEAT SHEET
    # =========================================================================
    story.append(PageBreak())  # Clean break to Page 3
    story.append(Paragraph("6. 80+ Multi-Currency Conversion Engine & Traveler Cheat Sheet", h1_style))
    story.append(
        Paragraph(
            "Traveling across borders introduces currency friction. ARC-NOMADE includes an integrated multi-currency conversion suite:",
            body_style,
        )
    )

    curr_features = [
        [
            Paragraph("<b>Component</b>", body_bold),
            Paragraph("<b>Core Capabilities & User Flow</b>", body_bold),
        ],
        [
            Paragraph("<b>80+ Currencies & Flags</b>", body_style),
            Paragraph("Full global coverage across Europe, Americas, Asia, Africa, Middle East, and Oceania. High-definition national flags loaded from <code>flagcdn.com</code> with emoji/code fallbacks.", body_style),
        ],
        [
            Paragraph("<b>CurrencySelect Dropdown</b>", body_style),
            Paragraph("Searchable selector with instant fuzzy matching by code ('JPY'), country ('Japan'), or symbol ('¥'). Includes quick-access chips for USD, EUR, GBP, JPY, CAD, AUD, INR, CHF, SGD, AED, and THB.", body_style),
        ],
        [
            Paragraph("<b>✈️ Traveler Cheat Sheet</b>", body_style),
            Paragraph("Built-in quick reference matrix converting benchmark values ($1, $5, $10, $20, $50, $100, $250, $500, $1,000) into destination currency for instant decision-making in taxis and cafes.", body_style),
        ],
        [
            Paragraph("<b>In-Modal Conversion</b>", body_style),
            Paragraph("When adding an expense abroad, toggle the 'Paid in foreign currency?' drawer. Enter the amount paid in local currency; it converts automatically and logs the exchange rate in notes.", body_style),
        ],
    ]
    curr_table = Table(curr_features, colWidths=[160, 380])
    curr_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), CARD_BG),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0F172A"), ROW_ALT]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(curr_table)
    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 7: EXPENSES & CIRCULAR DEBT SIMPLIFICATION
    # =========================================================================
    story.append(Paragraph("7. Expense Ledger & Circular Debt Simplification", h1_style))
    story.append(
        Paragraph(
            "Managing shared expenses in group travel usually leads to endless settlement friction. ARC-NOMADE automates fair splits with mathematical precision:",
            body_style,
        )
    )

    expense_points = [
        "<b>Split Flexibility:</b> Split costs Equally among selected travelers, assign Exact amounts, or allocate by Percentages.",
        "<b>Greedy Minimum Cash Flow:</b> Instead of Alice paying Bob who pays Charlie who pays Alice, the algorithm resolves net balances to the minimum possible number of peer-to-peer bank/cash transfers.",
        "<b>Settlement Matrix:</b> Visual dashboard showing exact net balances (green badge for creditors, red badge for debtors) and a 1-click 'Settle Payment' modal to record transactions.",
    ]
    for ep in expense_points:
        story.append(Paragraph(f"• {ep}", bullet_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 8: FLIGHT OPERATIONS & DIGITAL BOARDING PASSES
    # =========================================================================
    story.append(Paragraph("8. Flight Operations & Live Boarding Passes", h1_style))
    story.append(
        Paragraph(
            "Keep flight itineraries organized with photorealistic digital boarding passes:",
            body_style,
        )
    )

    flight_points = [
        "<b>Flight Logging:</b> Record airline code, flight number, departure/arrival airports (with IATA codes), gate, terminal, and seat.",
        "<b>Live State Machine Simulator:</b> Automatic transition between operational flight states: <i>Scheduled</i> &rarr; <i>Boarding</i> &rarr; <i>Departed</i> &rarr; <i>In-Flight</i> &rarr; <i>Landed</i>.",
        "<b>Boarding Pass Cards:</b> Visual airline cards featuring barcode visuals, seat badges, terminal callouts, and countdown timers.",
    ]
    for fp in flight_points:
        story.append(Paragraph(f"• {fp}", bullet_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 9: GROUP CHAT & EXECUTIVE EXPORTS (EXCEL & PDF)
    # =========================================================================
    story.append(PageBreak())  # Clean break to Page 4
    story.append(Paragraph("9. Real-Time Collaboration & Executive Dossier Exports", h1_style))
    story.append(
        Paragraph(
            "Expeditions require seamless team communication and offline document generation:",
            body_style,
        )
    )

    collab_points = [
        "<b>WebSocket Team Chat:</b> Real-time messaging with live avatar presence, typing indicators, and emoji reactions.",
        "<b>Role-Based Access Control (RBAC):</b> Grant OWNER, EDITOR, VIEWER, or EXPENSE_MANAGER permissions via shareable invite links.",
        "<b>Executive 6-Sheet Excel Dossier:</b> 1-click export of a formula-driven workbook featuring: Trip Overview, Itinerary Timetable, Flight Logistics, Expense Ledger (with live <code>=SUM()</code> formulas), Member Balances, and Category Breakdowns.",
        "<b>Print-Ready PDF Travel Dossier:</b> Generates a high-resolution, styled multi-page travel briefing ready for offline carry-on.",
    ]
    for cp in collab_points:
        story.append(Paragraph(f"• {cp}", bullet_style))

    story.append(Spacer(1, 14))

    # =========================================================================
    # CHAPTER 10: QUICK REFERENCE & KEYBOARD SHORTCUTS
    # =========================================================================
    story.append(Paragraph("10. Quick Reference & Nomad Pro-Tips", h1_style))

    tips_data = [
        [
            Paragraph("<b>Feature Area</b>", body_bold),
            Paragraph("<b>Pro-Tip / Best Practice</b>", body_bold),
        ],
        [
            Paragraph("<b>Currency Selector</b>", body_style),
            Paragraph("Press <font color='#38BDF8'><b>Escape</b></font> to close the currency dropdown instantly. Use the popular chips row for 1-click selection of top travel currencies.", body_style),
        ],
        [
            Paragraph("<b>CARTO Basemaps</b>", body_style),
            Paragraph("Toggle between CARTO Dark Matter for nighttime planning and CARTO Voyager or Satellite for outdoor trail exploration.", body_style),
        ],
        [
            Paragraph("<b>Expenses Abroad</b>", body_style),
            Paragraph("Use the 'Paid in foreign currency?' drawer when buying coffee or train tickets abroad to let ARC-NOMADE auto-calculate the conversion.", body_style),
        ],
        [
            Paragraph("<b>Offline Readiness</b>", body_style),
            Paragraph("Always export both the 6-Sheet Excel workbook and the PDF dossier before boarding long-haul flights with limited Wi-Fi.", body_style),
        ],
    ]
    tips_table = Table(tips_data, colWidths=[150, 390])
    tips_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), CARD_BG),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0F172A"), ROW_ALT]),
            ("BOX", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_CLR),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ])
    )
    story.append(tips_table)
    story.append(Spacer(1, 18))

    # Sign-off box
    signoff = Table(
        [[
            Paragraph(
                "<font color='#10B981'><b>Ready to explore the world?</b></font> Launch your first journey at <b>http://localhost:3000/trips/create</b> and let ARC-NOMADE map your adventure with effortless precision.",
                body_style,
            )
        ]],
        colWidths=[540],
    )
    signoff.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#064E3B")),
            ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#10B981")),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 12),
            ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ])
    )
    story.append(signoff)

    # Build PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated User Guide PDF at: {output_path}")


if __name__ == "__main__":
    output = sys.argv[1] if len(sys.argv) > 1 else "arc_nomade_how_the_site_works.pdf"
    generate_guide_pdf(output)
