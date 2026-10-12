@echo off
setlocal
set "ROOT=%~dp0"
set "BACKEND=%ROOT%backend"
set "FRONTEND=%ROOT%frontend"

echo.
echo  ==========================================
echo   AXIOM AI - First-Time Setup
echo  ==========================================
echo.

REM ── Check Ollama ──────────────────────────
echo [1/4] Checking Ollama...
where ollama >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Ollama not found.
    echo  Please download and install Ollama from: https://ollama.ai
    echo  Then run this setup again.
    pause
    exit /b 1
)
echo  OK - Ollama found.

REM ── Pull Models ───────────────────────────
echo.
echo [2/4] Pulling AI models (free - runs locally)...
echo  Pulling LLaMA 3.1 8B (main LLM ~4.7GB)...
ollama pull llama3.1
echo  Pulling nomic-embed-text (embeddings ~274MB)...
ollama pull nomic-embed-text
echo  OK - Models ready.

REM ── Install Python deps ───────────────────
echo.
echo [3/4] Installing Python backend dependencies...
cd /d "%BACKEND%"
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo  ERROR: pip install failed. Make sure Python 3.10+ is installed.
    pause
    exit /b 1
)
echo  OK - Python dependencies installed.

REM ── Install Node deps ─────────────────────
echo.
echo [4/4] Installing frontend dependencies...
cd /d "%FRONTEND%"
npm install
if %errorlevel% neq 0 (
    echo  ERROR: npm install failed. Make sure Node.js 18+ is installed.
    pause
    exit /b 1
)
echo  OK - Frontend dependencies installed.

echo.
echo  ==========================================
echo   Setup Complete! Run start.bat to launch.
echo  ==========================================
echo.
pause
