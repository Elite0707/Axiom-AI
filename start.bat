@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo  ==========================================
echo   AXIOM AI - Legal Compliance Platform
echo  ==========================================
echo.

REM Start Ollama in background (if not already running)
echo [1/3] Starting Ollama...
start "" /min ollama serve

timeout /t 2 /nobreak > nul

REM Start Backend
echo [2/3] Starting FastAPI backend on port 8000...
start "Axiom AI Backend" cmd /k "cd /d "%BACKEND%" && uvicorn main:app --reload --port 8000 --log-level info"

timeout /t 4 /nobreak > nul

REM Start Frontend
echo [3/3] Starting React frontend on port 5173...
start "Axiom AI Frontend" cmd /k "cd /d "%FRONTEND%" && npm run dev"

timeout /t 5 /nobreak > nul

REM Open Browser
echo.
echo  Opening Axiom AI...
start http://localhost:5173

echo.
echo  ┌─────────────────────────────────────────┐
echo  │           Axiom AI is Running           │
echo  ├─────────────────────────────────────────┤
echo  │  App:      http://localhost:5173        │
echo  │  API:      http://localhost:8000        │
echo  │  API Docs: http://localhost:8000/docs   │
echo  └─────────────────────────────────────────┘
echo.
echo  Close the Backend and Frontend windows to stop.
echo.
