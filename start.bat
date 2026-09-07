@echo off
setlocal enabledelayedexpansion
title ARC-NOMADE - Unified Full-Stack Launcher

echo ================================================================
echo           ARC-NOMADE - FULL-STACK DEVELOPMENT LAUNCHER
echo                 "Your Journey, Perfectly Mapped"
echo ================================================================
echo.

:: Get script directory without trailing backslash
set "PROJECT_ROOT=%~dp0"
if "%PROJECT_ROOT:~-1%"=="\" set "PROJECT_ROOT=%PROJECT_ROOT:~0,-1%"

cd /d "%PROJECT_ROOT%"

:: 1. Verify Prerequisites
echo [*] Checking prerequisites...
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in PATH!
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: 2. Check Backend Environment Configuration
if not exist "%PROJECT_ROOT%\backend\.env" (
    if exist "%PROJECT_ROOT%\backend\.env.example" (
        echo [*] Creating backend\.env from template...
        copy "%PROJECT_ROOT%\backend\.env.example" "%PROJECT_ROOT%\backend\.env" >nul
    )
)

:: 3. Check Frontend Environment Configuration
if not exist "%PROJECT_ROOT%\frontend\.env.local" (
    if exist "%PROJECT_ROOT%\frontend\.env.example" (
        echo [*] Creating frontend\.env.local from template...
        copy "%PROJECT_ROOT%\frontend\.env.example" "%PROJECT_ROOT%\frontend\.env.local" >nul
    )
)

:: 4. Check Database Seeds
if not exist "%PROJECT_ROOT%\arc_nomade.db" (
    echo [*] arc_nomade.db not found. Seeding initial demo data...
    if exist "%PROJECT_ROOT%\venv\Scripts\python.exe" (
        "%PROJECT_ROOT%\venv\Scripts\python.exe" "%PROJECT_ROOT%\database\seeds\seed_data.py"
    ) else (
        python "%PROJECT_ROOT%\database\seeds\seed_data.py"
    )
)

:: 5. Launch Backend (FastAPI)
echo.
echo [1/2] Launching FastAPI Backend on http://localhost:8000 ...
start "ARC-NOMADE Backend (FastAPI :8000)" cmd /k "cd /d "%PROJECT_ROOT%" && if exist "%PROJECT_ROOT%\venv\Scripts\activate.bat" (call "%PROJECT_ROOT%\venv\Scripts\activate.bat") && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

:: 6. Launch Frontend (Next.js)
echo [2/2] Launching Next.js Frontend on http://localhost:3000 ...
start "ARC-NOMADE Frontend (Next.js :3000)" cmd /k "cd /d "%PROJECT_ROOT%\frontend" && npm run dev"

echo.
echo ================================================================
echo   SUCCESS: Both services are launching in dedicated windows!
echo ================================================================
echo.
echo   * Frontend Web UI:        http://localhost:3000
echo   * Backend Swagger API:    http://localhost:8000/docs
echo   * Backend Health Check:   http://localhost:8000/health
echo.
echo   Demo Login Accounts (Password: password123):
echo   - Alex Mercer (Owner):        alex@arcnomad.com
echo   - Sarah Jenkins (Editor):     sarah@arcnomad.com
echo   - Marco Rossi (Editor):       marco@arcnomad.com
echo   - Elena Vance (Expense Mgr):  elena@arcnomad.com
echo.
echo ================================================================
echo   Keep the backend and frontend terminal windows open.
echo   To stop the servers, close their respective terminal windows.
echo ================================================================
echo.
pause
