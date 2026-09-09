@echo off
setlocal EnableDelayedExpansion
title ARC-NOMADE - Stop Services

echo ===============================================================================
echo                 🛑 ARC-NOMADE - SHUTTING DOWN LOCAL SERVICES
echo ===============================================================================
echo.
echo Scanning and releasing ports 8000 (FastAPI / Uvicorn) and 3000 (Next.js / Node)...

set "KILLED=0"

:: Kill processes on port 8000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":8000 " ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo [TERMINATE] Killing backend process on Port 8000 [PID: %%a]
        taskkill /F /T /PID %%a >nul 2>&1
        set "KILLED=1"
    )
)

:: Kill processes on port 3000
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000 " ^| findstr "LISTENING"') do (
    if not "%%a"=="0" (
        echo [TERMINATE] Killing frontend process on Port 3000 [PID: %%a]
        taskkill /F /T /PID %%a >nul 2>&1
        set "KILLED=1"
    )
)

echo.
if "!KILLED!"=="1" (
    echo [SUCCESS] Ports 8000 and 3000 are now clear!
) else (
    echo [INFO] No active processes were found listening on ports 8000 or 3000.
)
echo.
echo ===============================================================================
echo Shutdown complete. Window will close in 3 seconds.
timeout /t 3 /nobreak >nul 2>&1 || ping -n 4 127.0.0.1 >nul 2>&1
exit /b 0
