Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "  ARC-NOMADE Full-Stack Development Launcher" -ForegroundColor Green
Write-Host "  Your Journey, Perfectly Mapped. 🧭✈️" -ForegroundColor Yellow
Write-Host "====================================================" -ForegroundColor Cyan

# Determine project root
$ProjectRoot = $PSScriptRoot

Write-Host "`n[1/2] Launching Backend Server on http://127.0.0.1:8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$ProjectRoot'; if (Test-Path '.\venv\Scripts\Activate.ps1') { .\venv\Scripts\Activate.ps1 }; python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Launching Frontend Server on http://localhost:3000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location -Path '$ProjectRoot\frontend'; npm run dev"

Write-Host "`n====================================================" -ForegroundColor Green
Write-Host " Both servers launched in separate terminal windows!" -ForegroundColor Green
Write-Host " - Frontend UI:        http://localhost:3000" -ForegroundColor White
Write-Host " - Backend Swagger UI: http://localhost:8000/docs" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
