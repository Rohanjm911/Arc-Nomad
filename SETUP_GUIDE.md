# ARC-NOMADE — Project Setup & Run Guide 🧭✈️

> **ARC-NOMADE: Your Journey, Perfectly Mapped.**  
> An AI-Powered Collaborative Travel Planning & Expedition Management Platform built with Next.js 16 (Turbopack), React 19, FastAPI, Tailwind CSS, Leaflet Maps (OpenStreetMap, CARTO Dark Matter & Voyager, Esri Satellite), OpenRouter AI, Google Gemini, Multi-Currency Engine (80+ world currencies with national flags), and ReportLab / openpyxl document generators.

---

## 📋 System Requirements

Ensure you have the following installed on your machine:
* **Node.js**: v18.0+ (v20+ LTS recommended) & `npm` v9+
* **Python**: v3.10+ (v3.11, v3.12, v3.13, or v3.14)
* **Git**: latest version

---

## 🚀 Quick Start (Step-by-Step)

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd Arc-Nomad
```

---

### 2. Backend Setup (FastAPI + Python)

#### A. Create and Activate a Virtual Environment

**Windows (PowerShell):**
```powershell
# In the project root (Arc-Nomad)
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**macOS / Linux (Bash/Zsh):**
```bash
# In the project root (Arc-Nomad)
python3 -m venv venv
source venv/bin/activate
```

#### B. Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

#### C. Configure Environment Variables

Create `backend/.env` (or copy from `backend/.env.example`):

```bash
# Windows PowerShell
Copy-Item backend\.env.example backend\.env

# macOS / Linux
cp backend/.env.example backend/.env
```

Contents of `backend/.env`:
```env
PROJECT_NAME="ARC-NOMADE API"
SECRET_KEY="arc_nomade_super_secret_jwt_key_2026_voyage_secure_token"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (Default uses local SQLite - zero setup required)
DATABASE_URL="sqlite:///./arc_nomade.db"

# OpenRouter AI (Recommended - supports hundreds of models)
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_MODEL="google/gemini-2.5-flash"

# Google Gemini AI (Alternative direct SDK provider)
GEMINI_API_KEY=""
GEMINI_MODEL="gemini-3.7-flash"

# AI Provider Selection: "auto", "openrouter", "gemini", "mock"
AI_PROVIDER="auto"

# CARTO Basemaps API Key (for watermark-free Dark Matter and Voyager tiles)
CARTO_API_KEY="cb1_2vep_1_9546c170df238ee0af73db4d"

# Weather (Optional - Open-Meteo free API is used by default)
OPENWEATHER_API_KEY=""
```

> [!TIP]
> **Zero External Keys Needed to Test**: ARC-NOMADE comes equipped with free global geocoding (Open-Meteo), free Leaflet maps (OpenStreetMap, Dark Matter, Satellite), 80+ currency exchange rates, and an offline smart travel architect fallback that functions even without any external API keys!

#### D. Start the Backend API Server

From the **project root (`Arc-Nomad`)**:
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

* **Backend API Base URL**: `http://127.0.0.1:8000/api/v1`
* **Interactive Swagger UI (API Docs)**: `http://127.0.0.1:8000/docs`
* **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

### 3. Frontend Setup (Next.js 16 + React 19 + TypeScript)

Open a **new terminal window/tab**:

#### A. Navigate to Frontend Directory and Install Dependencies

```bash
cd frontend
npm install
```

#### B. Configure Frontend Environment (Optional)

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_CARTO_API_KEY=cb1_2vep_1_9546c170df238ee0af73db4d
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_HOST=localhost:8000
```
*(If omitted, defaults to public tile endpoints automatically)*.

#### C. Start Frontend Development Server

```bash
npm run dev
```
* **Frontend Web Application**: `http://localhost:3000`

---

## 🧪 Running Tests & Validation

### Run Backend Tests (Pytest)
```bash
# From project root with venv activated
python -m pytest
```
* Runs all **17 automated test suites** across:
  * `test_ai_weather.py`: AI itinerary and discovery generation with OpenRouter token optimization, Open-Meteo weather fallback.
  * `test_auth.py`: JWT authentication, user registration, login, and RBAC token resolution.
  * `test_currency.py`: 80+ currency catalog coverage, live exchange rates, and conversion logic.
  * `test_expenses.py`: Expense creation, split calculations, and debt simplification settlements.
  * `test_exports.py`: Executive 6-sheet Excel dossier and ReportLab PDF itinerary generation.
  * `test_openrouter.py`: OpenRouter client initialization, JSON markdown cleaning, and dynamic provider fallback.
  * `test_trips.py`: Trip CRUD, global geocoding, itinerary day creation, and spatial coordinates persistence.

### Run Frontend Type Check & Production Build
```bash
# In frontend directory
npm run build
```
* Compiles the production Next.js application using Turbopack with zero TypeScript or bundling errors.

---

## 🔑 Core Features & Highlights

1. **Brand Travel Logo & Tab Favicons**:
   - Custom travel emblem featuring a supersonic passenger jet in flight across an orbital globe latitude curve.
   - Cross-browser tab favicons (`/favicon.svg`, `/icon.svg`, `/logo.svg`) and high-DPI scaling across Navbar, Footer, and Auth screens.

2. **Live Geocoded Trip Planning Wizard & Dynamic Currency Selector**:
   - Type any destination worldwide (e.g. *Barcelona*, *Kyoto*, *Reykjavik*). The live map automatically flies to the target city, drops a pin, and saves exact coordinates.
   - **Multi-Currency Wizard**: Choose from **80+ global currencies** with respective country flags and live search.
   - **Dynamic Budget Icon**: The *Total Group Budget* input prefix icon dynamically adapts to the selected currency symbol (`$`, `€`, `£`, `¥`, `₹`, `CA$`, `AED`, `CHF`, etc.).
   - **Step 4 Summary**: Renders the country flag badge next to the formatted total budget before trip launch.

3. **AI Travel Architect (OpenRouter & Gemini)**:
   - Generate custom multi-day itineraries with structured timetables, estimated costs, and coordinates using your OpenRouter API key (`google/gemini-2.5-flash`, `openai/gpt-4o-mini`, etc.) with `max_tokens: 4500` token budget optimization.

4. **Leaflet Maps with CARTO & Live Style Switcher**:
   - Real-time style toggle between **Dark Matter**, **OpenStreetMap Standard**, and **Satellite Imagery**.
   - Authenticated CARTO tile delivery via `?key=YOUR_KEY` eliminating watermarks.
   - High-performance memoization (`locationsRef`, static empty array fallbacks) preventing infinite React update loops.
   - Custom colored pins (Cyan for Itinerary, Purple for Discoveries), interactive stop cards, and animated route polylines.

5. **Multi-Currency Calculator & Converter Engine (80+ Currencies with Flags)**:
   - Dedicated `💱 Currency Calculator` tab in the trip Expenses view.
   - Support for **80+ world currencies** with high-definition **country flag badges** (`flagcdn.com`), currency symbols, and full names.
   - Custom searchable `CurrencySelect` dropdown featuring:
     - Real-time fuzzy search by code, name, symbol, or country.
     - Quick-access popular currency chips (`USD`, `EUR`, `GBP`, `JPY`, `CAD`, `AUD`, `INR`, `CHF`, `SGD`, `AED`, `THB`).
     - Keyboard navigation (<kbd>Escape</kbd> to close, auto-focus search).
     - Integrated across Trip Creation, Trip Settings Modal, User Profile, and Expense Conversion Tool.
   - Built-in in-modal currency conversion assistant when logging expenses abroad.
   - **✈️ Traveler Cheat Sheet Matrix** converting benchmark values ($1 to $1,000) for instant dining and shopping decisions.

6. **Circular Debt Simplification & Settlement Ledger**:
   - Equal, exact, or percentage splits with Greedy Minimum Cash Flow optimization to minimize net group transactions.

7. **Live Flight Operations & Boarding Passes**:
   - Realistic boarding pass cards with background flight state simulation (Scheduled, Boarding, Departed, In-Flight, Landed).

8. **Real-time Group Chat**:
   - Low-latency WebSocket messaging with live presence and emoji reactions.

9. **Executive 6-Sheet Excel Dossier Export**:
   - Formula-driven spreadsheet export (Trip Overview, Itinerary Schedule, Flights & Logistics, Expense Ledger with dynamic `=SUM()` formulas, Balances & Settlements, and Category Breakdown).

10. **Print-Ready PDF Travel Dossier**:
    - Multi-page styled travel report generated on-demand via ReportLab.

---

## 🛠️ Common Troubleshooting

| Issue | Solution |
| :--- | :--- |
| `CARTO map shows "API KEY REQUIRED" watermark` | CARTO requires the URL query parameter to be `?key=YOUR_KEY` (not `api_key=`). Perform a hard browser refresh (`Ctrl + F5` or `Ctrl + Shift + R`) to clear cached watermarked tiles. |
| `Maximum update depth exceeded in map` | The `selectedLocation` prop and `locations` arrays are now memoized and guarded by `locationsRef` to prevent re-render loops. |
| `Port 8000 or 3000 already in use` | Run `Get-NetTCPConnection -LocalPort 8000, 3000` in PowerShell and terminate the stale process using `Stop-Process -Id <PID> -Force`. |
| `ModuleNotFoundError: No module named 'backend'` | Make sure you run `uvicorn` from the repository root folder (`Arc-Nomad`), not from inside `backend/`. |
| `OpenRouter 402 Insufficient Credits` | ARC-NOMADE automatically allocates `max_tokens: 4500` to fit within credit limits and falls back gracefully to secondary models (`gemini-2.5-flash` &rarr; `gpt-4o-mini` &rarr; `deepseek-chat`). |
| `Country flag images not loading` | Flags are loaded via `flagcdn.com`. If offline, `CountryFlag` gracefully falls back to emoji flags or the 2-letter currency ISO code. |
| `Backend changes not reflecting` | Ensure the backend was launched with `--reload` flag: `python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload`. |
| `SQLite database locked` | Ensure no multiple write operations or database viewers have locked `arc_nomade.db`. |
