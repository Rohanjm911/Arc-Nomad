@echo off
title ARC-NOMADE Full-Stack Launcher
echo ====================================================
echo   ARC-NOMADE Full-Stack Development Launcher
echo   Your Journey, Perfectly Mapped.
echo ====================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "ARC-NOMADE Backend (FastAPI)" cmd /k "cd /d "%~dp0" && call venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Starting Next.js Frontend on http://localhost:3000 ...
start "ARC-NOMADE Frontend (Next.js)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ====================================================
echo  Services have been launched in dedicated windows!
echo  Frontend UI:    http://localhost:3000
echo  API Swagger UI: http://localhost:8000/docs
echo ====================================================
echo.
pause
