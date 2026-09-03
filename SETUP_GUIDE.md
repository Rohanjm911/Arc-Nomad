# 🚀 How to Start ARC-NOMADE

Welcome to **ARC-NOMADE** (*Your Journey, Perfectly Mapped* 🧭✈️). Follow this guide to set up and run the full-stack application locally.

---

## 📋 System Prerequisites

Before starting, ensure you have the following installed on your machine:

1. **Python 3.10+** (Python 3.10, 3.11, or 3.12 recommended)
   - Verify: `python --version`
2. **Node.js 18+** (Node.js 20+ LTS recommended) & **npm**
   - Verify: `node -v` and `npm -v`
3. **Git** (optional, for version control)

---

## ⚡ Method 1: 1-Click Fast Start (Windows)

If you are on Windows, helper launcher scripts are provided in the project root:

### Option A: Using Batch Script (Double-Click or Command Prompt)
```cmd
start_dev.bat
```

### Option B: Using PowerShell
```powershell
.\start_dev.ps1
```

> **Note:** If PowerShell gives a script execution policy warning, run this once:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

## 🛠️ Method 2: Step-by-Step Manual Setup (Recommended for First Run)

To run the application manually, you will need **two terminal windows**: one for the FastAPI backend and one for the Next.js frontend.

---

### Terminal 1: Backend Setup (FastAPI Python)

#### 1. Navigate to the project root
```bash
cd /path/to/Arc-Nomad
```

#### 2. Create and Activate a Python Virtual Environment
- **On Windows (PowerShell):**
  ```powershell
  python -m venv venv
  .\venv\Scripts\Activate.ps1
  ```
- **On Windows (Command Prompt):**
  ```cmd
  python -m venv venv
  venv\Scripts\activate.bat
  ```
- **On macOS / Linux:**
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```

#### 3. Install Backend Dependencies
```bash
pip install -r backend/requirements.txt
```

#### 4. Configure Backend Environment Variables
Create a `backend/.env` file (copied from `.env.example`):
```bash
# Windows PowerShell:
Copy-Item backend/.env.example backend/.env

# macOS / Linux / Git Bash:
cp backend/.env.example backend/.env
```

*(Optional)* You can edit `backend/.env` to add your `GEMINI_API_KEY`, `MAPBOX_ACCESS_TOKEN`, or leave them blank to use the built-in intelligent mock AI and OpenStreetMap providers.

#### 5. Seed the Database with Sample Trips & Demo Accounts
```bash
python database/seeds/seed_data.py
```
*This populates sample trips (Tokyo Expedition, etc.), expenses, flight trackers, activities, and demo user accounts.*

#### 6. Start the Backend API Server
```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

✅ **Backend is now running!**
- **API URL:** [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

### Terminal 2: Frontend Setup (Next.js 15+ React)

#### 1. Open a new terminal and navigate to the frontend directory
```bash
cd frontend
```

#### 2. Configure Frontend Environment Variables
Create a `frontend/.env.local` file (copied from `.env.example`):
```bash
# Windows PowerShell:
Copy-Item .env.example .env.local

# macOS / Linux / Git Bash:
cp .env.example .env.local
```

The default contents are already configured for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_HOST=localhost:8000
```

#### 3. Install Node.js Dependencies
```bash
npm install
```

#### 4. Start the Next.js Development Server
```bash
npm run dev
```

✅ **Frontend is now running!**
- **Application UI:** [http://localhost:3000](http://localhost:3000)

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

You can log in with any of these pre-configured team accounts to explore collaborative features:

| User | Username | Email | Password | Role in Tokyo Trip |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Mercer** | `alex_nomad` | `alex@arcnomad.com` | `password123` | **Trip Leader / Owner** |
| **Sarah Jenkins** | `sarah_voyage` | `sarah@arcnomad.com` | `password123` | **Editor** |
| **Marco Rossi** | `marco_explorer` | `marco@arcnomad.com` | `password123` | **Editor** |
| **Elena Vance** | `elena_wander` | `elena@arcnomad.com` | `password123` | **Expense Manager** |

> 💡 *Or click the **Demo Login / Quick Login** button on the Login page for instant 1-click authentication.*

---

## 🌐 URLs & Service Ports Overview

| Service | Address | Description |
| :--- | :--- | :--- |
| **Web Frontend** | `http://localhost:3000` | Main Next.js Web Application UI |
| **Backend API** | `http://localhost:8000` | FastAPI Server Root |
| **Interactive API Docs** | `http://localhost:8000/docs` | Swagger UI API Explorer & Tester |
| **ReDoc API Docs** | `http://localhost:8000/redoc` | Alternative ReDoc API Documentation |
| **WebSocket Endpoint** | `ws://localhost:8000/api/v1/chat/ws/{trip_id}/{token}` | Real-time Trip Chat & Activity Sync |

---

## 🧪 Running Verification & Tests

### Backend Unit & Integration Tests:
```powershell
python -m pytest backend/tests -v
```

### Full-Stack 12-Point End-to-End Verification:
```powershell
python backend/tests/verify_full_stack.py
```

---

## ❓ Troubleshooting & FAQs

### 1. PowerShell Script Execution Error (`Activate.ps1 cannot be loaded`)
If you see an error when running `.\venv\Scripts\Activate.ps1`:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\Activate.ps1
```

### 2. Port `8000` or `3000` already in use
- **Port 8000 (Backend)**: Kill any existing uvicorn process or specify another port:
  ```bash
  python -m uvicorn backend.app.main:app --port 8001 --reload
  ```
  *(Remember to update `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_HOST` in `frontend/.env.local` if changed)*
- **Port 3000 (Frontend)**: Next.js will automatically suggest running on port `3001`.

### 3. Resetting / Rebuilding the Database
If you want to start fresh with demo data:
1. Delete `arc_nomade.db` in the project root.
2. Run `python database/seeds/seed_data.py`.

### 4. Gemini AI Key & Mapbox Tokens
- **Gemini AI**: If no `GEMINI_API_KEY` is provided in `backend/.env`, the system gracefully uses an intelligent mock provider that generates rich travel recommendations.
- **Maps**: If no `MAPBOX_ACCESS_TOKEN` is provided, the frontend seamlessly uses OpenStreetMap and Carto tile layers.
