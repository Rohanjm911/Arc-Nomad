# ARC-NOMADE 🧭✈️
### *"Your Journey, Perfectly Mapped."*

ARC-NOMADE is an AI-powered collaborative travel planning and trip-management platform designed for nomad collectives, friends, and expedition crews.

---

## 🌟 Core Flow: Discover → Plan → Collaborate → Travel → Track → Manage → Export

1. **Discover**: Gemini AI Curated Recommendations with category filters, vibes, and 1-click addition to your itinerary.
2. **Plan**: Multi-day itinerary timetables, activity drag-and-drop sequencing, interactive coordinates, and live Open-Meteo weather forecasts.
3. **Collaborate**: Real-time group chat via WebSockets with typing indicators, online member roster, and emoji reactions.
4. **Travel**: Live flight status tracking (Boarding, Departed, Delayed, Cancelled) with automated in-app notifications.
5. **Track**: Interactive spatial maps plotting all itinerary stops, hotels, and recommendations with category filters and popup cards.
6. **Manage**: Authoritative expense split calculations (Equal, Percentage, Exact) and optimized debt reduction (Minimum Cash Flow Greedy settlement optimizer).
7. **Export**: Executive multi-page ReportLab PDF travel dossier and multi-sheet openpyxl Excel financial workbooks.

---

## 🚀 Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS, Dark Mode Obsidian theme, Custom Glassmorphism, Micro-animations
- **Visuals & Maps**: Recharts (Interactive category & member spending breakdown charts), Mapbox / OpenStreetMap canvas
- **Icons**: Lucide React

### Backend
- **Framework**: Python FastAPI, Pydantic v2
- **ORM & DB**: SQLAlchemy 2.0 (PostgreSQL & SQLite zero-config compatibility)
- **Real-Time**: WebSockets for trip-scoped group chat
- **AI Engine**: Google Gemini API (`GeminiAIProvider` with `gemini-3.7-flash` via official `google-genai` SDK + `MockAIProvider` fallback)
- **Weather**: Open-Meteo REST API integration with in-memory caching
- **Export Engines**: ReportLab for custom executive PDF dossiers & openpyxl for Excel financial workbooks
- **Testing**: Pytest & automated full-stack verification suites

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

For instant exploration and testing, the following accounts are pre-seeded:

| Name | Username | Email | Password | Role in Tokyo Trip |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Mercer** | `alex_nomad` | `alex@arcnomad.com` | `password123` | **OWNER** |
| **Sarah Jenkins** | `sarah_voyage` | `sarah@arcnomad.com` | `password123` | **EDITOR** |
| **Marco Rossi** | `marco_explorer` | `marco@arcnomad.com` | `password123` | **EDITOR** |
| **Elena Vance** | `elena_wander` | `elena@arcnomad.com` | `password123` | **EXPENSE_MANAGER** |

---

## 🛠️ Getting Started

### 1. Backend Setup & Run

```bash
# In project root
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r backend/requirements.txt

# Run database seeder (Optional, seeds demo trips, expenses, flights)
python database/seeds/seed_data.py

# Start FastAPI server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend API interactive documentation will be live at: `http://localhost:8000/docs`

### 2. Frontend Setup & Run

```bash
cd frontend
npm install
npm run dev
```

Frontend application will be live at: `http://localhost:3000`

---

## 🧪 Testing

```bash
# Run backend unit & integration tests
python -m pytest backend/tests -v

# Run full-stack 12-point end-to-end verification
python backend/tests/verify_full_stack.py
```
