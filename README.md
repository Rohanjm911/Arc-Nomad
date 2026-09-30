<p align="center">
  <img src="assets/logo.png" alt="ARC-NOMAD Logo" width="220" />
</p>

<!-- Animated System Hero Banner -->
<p align="center">
  <img src="assets/header-animation.svg" alt="ARC-NOMAD System Animation" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16_Turbopack-black?style=flat&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/Design-Apple_Matte_Titanium-181820?style=flat" alt="Apple Matte Titanium" />
  <img src="https://img.shields.io/badge/Status-Expeditions_Online-34d399?style=flat" alt="Expeditions Online" />
</p>

<p align="center">
  <img src="assets/animated-divider.svg" alt="Divider" width="100%" />
</p>

ARC-NOMAD is an AI-powered collaborative travel planning and trip-management platform designed for nomad collectives, friends, and expedition crews. Built with Apple-inspired Matte Titanium aesthetics, real-time WebSockets synchronization, and Google Gemini AI itinerary generation.

<p align="center">
  <img src="assets/animated-divider.svg" alt="Divider" width="100%" />
</p>

## 🌟 Core Flow: Discover → Plan → Collaborate → Travel → Track → Manage → Export

1. **Discover**: Gemini AI Curated Recommendations with category filters, vibes, and 1-click addition to your itinerary.
2. **Plan**: Multi-day itinerary timetables, activity drag-and-drop sequencing, interactive coordinates, and live Open-Meteo weather forecasts.
3. **Collaborate**: Real-time group chat via WebSockets with typing indicators, online member roster, and emoji reactions.
4. **Travel**: Live flight status tracking (Boarding, Departed, Delayed, Cancelled) with automated in-app notifications and real-time cockpit radar.
5. **Track**: Interactive spatial maps plotting all itinerary stops, hotels, and recommendations with category filters and popup cards.
6. **Manage**: Authoritative expense split calculations (Equal, Percentage, Exact) and optimized debt reduction (Minimum Cash Flow Greedy settlement optimizer).
7. **Export**: Executive multi-page ReportLab PDF travel dossier and multi-sheet openpyxl Excel financial workbooks.

<!-- Animated Flight Radar & Telemetry Display -->
<p align="center">
  <img src="assets/flight-radar.svg" alt="Live Flight Radar Telemetry" width="100%" />
</p>

<p align="center">
  <img src="assets/animated-divider.svg" alt="Divider" width="100%" />
</p>

## 🚀 Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling & UI**: Tailwind CSS v4, Apple Matte Titanium & Minimalist Ice design system, Frosted Glassmorphism, Micro-animations
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

<p align="center">
  <img src="assets/animated-divider.svg" alt="Divider" width="100%" />
</p>

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

For instant exploration and testing, the following Indian explorer accounts are pre-seeded with custom profiles:

| Avatar | Name | Username | Email | Password | Role in Tokyo Trip |
| :---: | :--- | :--- | :--- | :--- | :--- |
| <img src="frontend/public/avatars/aarav.jpg" width="36" height="36" style="border-radius:50%;object-fit:cover" /> | **Aarav Sharma** | `alex_nomad` / `aarav_nomad` | `alex@arcnomad.com` | `password123` | **OWNER** |
| <img src="frontend/public/avatars/priya.jpg" width="36" height="36" style="border-radius:50%;object-fit:cover" /> | **Priya Patel** | `sarah_voyage` / `priya_voyage` | `sarah@arcnomad.com` | `password123` | **EDITOR** |
| <img src="frontend/public/avatars/kabir.jpg" width="36" height="36" style="border-radius:50%;object-fit:cover" /> | **Kabir Mehta** | `marco_explorer` / `kabir_explorer` | `marco@arcnomad.com` | `password123` | **EDITOR** |
| <img src="frontend/public/avatars/ananya.jpg" width="36" height="36" style="border-radius:50%;object-fit:cover" /> | **Ananya Roy** | `elena_wander` / `ananya_roy` | `elena@arcnomad.com` | `password123` | **EXPENSE_MANAGER** |

<p align="center">
  <img src="assets/animated-divider.svg" alt="Divider" width="100%" />
</p>

## 🛠️ Getting Started

> 📖 **Full Guide**: See [HOW_TO_START.md](file:///d:/projects%20and%20certificates/projects/web/Arc-Nomad/HOW_TO_START.md) for detailed prerequisites, step-by-step setup instructions, troubleshooting, and 1-click launcher scripts (`start.bat`, `start_dev.ps1`).

```cmd
:: Double-click start.bat in the project root, or run via terminal:
start.bat
```
*(Or in PowerShell: `.\start_dev.ps1`)*

This script automatically verifies prerequisites, initializes environment configs (`.env`), seeds demo data (`arc_nomade.db`), and starts both the FastAPI backend (`:8000`) and Next.js frontend (`:3000`) in separate dedicated windows.

### 🛠️ Manual Step-by-Step Setup

#### 1. Backend Setup (FastAPI Python)

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

<p align="center">
  <img src="assets/animated-divider.svg" alt="Divider" width="100%" />
</p>

## 🧪 Testing

```bash
# Run backend unit & integration tests
python -m pytest backend/tests -v

# Run full-stack 12-point end-to-end verification
python backend/tests/verify_full_stack.py
```
