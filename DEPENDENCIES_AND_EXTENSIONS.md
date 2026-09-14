# 📦 Arc-Nomad: Prerequisites, Extensions & Dependencies

This document details all the **system prerequisites**, **recommended IDE / VS Code extensions**, and **packages (Backend & Frontend)** required to run and develop the **Arc-Nomad** application.

---

## 1. ⚙️ System Prerequisites

| Tool | Minimum Version | Purpose | Download / Command |
| :--- | :--- | :--- | :--- |
| **Python** | `3.10+` | Backend runtime & API service | [python.org](https://www.python.org/downloads/) (`python --version`) |
| **Node.js** | `18.0+` (LTS recommended) | Frontend Next.js runtime | [nodejs.org](https://nodejs.org/) (`node -v`) |
| **npm** | `9.0+` | Frontend package management | Bundled with Node.js (`npm -v`) |
| **Git** | Any modern version | Version control | [git-scm.com](https://git-scm.com/) (`git --version`) |

---

## 2. 🧩 Recommended VS Code / Cursor Extensions

For the best developer experience, syntax highlighting, formatting, and intellisense:

| Extension Name | Extension ID | Description |
| :--- | :--- | :--- |
| **Python** | `ms-python.python` | Python language support, linting, debugging |
| **Pylance** | `ms-python.vscode-pylance` | Fast, feature-rich language support for Python |
| **Tailwind CSS IntelliSense** | `bradlc.vscode-tailwindcss` | Autocomplete, syntax highlighting, and linting for Tailwind |
| **ESLint** | `dbaeumer.vscode-eslint` | Integrates ESLint into VS Code |
| **Prettier - Code formatter** | `esbenp.prettier-vscode` | Consistent code formatting for JS/TS/CSS/JSON |
| **Postman / Thunder Client** | `rangav.vscode-thunder-client` | In-editor REST API testing (FastAPI endpoints) |
| **SQLite Viewer** | `qwtel.sqlite-viewer` | Inspect local SQLite database (`arc_nomade.db`) directly in editor |
| **DotENV** | `mikestead.dotenv` | Syntax highlighting for `.env` and `.env.local` files |

---

## 3. 🐍 Backend Packages (`backend/requirements.txt`)

Installed inside your Python virtual environment (`venv`).

### Installation Command:
```bash
# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install requirements:
pip install -r backend/requirements.txt
```

### Dependency Breakdown:
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `fastapi` | `>=0.115.0` | High-performance asynchronous REST API framework |
| `uvicorn` | `>=0.30.0` | ASGI web server for FastAPI |
| `sqlalchemy` | `>=2.0.30` | SQL toolkit & Object-Relational Mapper (ORM) |
| `alembic` | `>=1.13.0` | Database schema migrations |
| `pydantic` | `>=2.8.0` | Data validation and parsing using Python type hints |
| `pydantic-settings` | `>=2.4.0` | Environment settings management |
| `python-jose[cryptography]` | `>=3.3.0` | JWT token generation and verification |
| `passlib[bcrypt]` | `>=1.7.4` | Password hashing library |
| `bcrypt` | `>=4.0.0` | Cryptographic hashing implementation |
| `reportlab` | `>=4.2.0` | PDF export generation (itineraries & expenses) |
| `openpyxl` | `>=3.1.5` | Excel (.xlsx) report generation & export |
| `google-genai` | `>=0.1.0` | Google Gemini AI SDK for itinerary and trip generation |
| `email-validator` | `>=2.0.0` | Robust email validation for user auth |
| `httpx` | `>=0.27.0` | Async HTTP client for external APIs |
| `pytest` | `>=8.0.0` | Python test framework |
| `pytest-asyncio` | `>=0.23.0` | Async test runner support for pytest |
| `websockets` | `>=12.0` | Real-time WebSocket communication |
| `python-multipart` | `>=0.0.9` | Parsing form data and file uploads |
| `psycopg2-binary` | `>=2.9.9` | PostgreSQL database adapter (production) |

---

## 4. 💻 Frontend Packages (`frontend/package.json`)

Installed inside the `frontend/` directory.

### Installation Command:
```bash
cd frontend
npm install
```

### Production Dependencies:
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `16.3.4` | React framework for server-side rendering & app routing |
| `react` | `19.2.8` | Core UI library |
| `react-dom` | `19.2.8` | React DOM renderer |
| `leaflet` | `^1.9.4` | Interactive mobile-friendly map engine |
| `@types/leaflet` | `^1.9.22` | TypeScript definitions for Leaflet |
| `mapbox-gl` | `^3.29.0` | WebGL-based vector maps |
| `lucide-react` | `^1.39.0` | Modern, lightweight UI icon library |
| `recharts` | `^3.10.1` | Interactive charts & graphs for expense analytics |
| `clsx` | `^2.1.1` | Utility for conditionally constructing class names |
| `tailwind-merge` | `^3.6.0` | Merge Tailwind CSS classes without conflict |
| `class-variance-authority`| `^0.7.1` | Variant-driven component styling helper |
| `canvas-confetti` | `^1.9.4` | Celebration confetti animations for booking milestones |

### Dev Dependencies:
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5` | Static type checking |
| `tailwindcss` | `^4` | Utility-first CSS framework |
| `@tailwindcss/postcss` | `^4` | PostCSS plugin for Tailwind CSS v4 |
| `eslint` | `^9` | JavaScript and TypeScript linting |
| `eslint-config-next` | `16.3.4` | Next.js specific ESLint configuration |
| `@types/node` | `^20` | TypeScript definitions for Node.js |
| `@types/react` | `^19` | TypeScript definitions for React |
| `@types/react-dom` | `^19` | TypeScript definitions for React DOM |
| `@types/mapbox-gl` | `^3.4.1` | TypeScript definitions for Mapbox GL |
| `@types/canvas-confetti`| `^1.9.0` | TypeScript definitions for canvas-confetti |

---

## 5. 🚀 Quick Start Summary

Once prerequisites and packages are in place, start both backend & frontend with a single command:

```cmd
start.bat
```
- **Frontend URL:** http://localhost:3000
- **Backend API & Swagger Docs:** http://localhost:8000/docs
