@echo off
setlocal
cd /d "%~dp0"

echo.
echo ====================================================
echo   Pushing Axiom AI to GitHub: Elite0707/Axiom-AI
echo ====================================================
echo.

git push -u origin main

if %errorlevel% neq 0 (
    echo.
    echo [NOTE] If you haven't created the repository on GitHub yet:
    echo 1. Go to: https://github.com/new
    echo 2. Repository name: Axiom-AI
    echo 3. Click 'Create repository' (leave README/gitignore unchecked)
    echo 4. Run this script again!
    echo.
) else (
    echo.
    echo ====================================================
    echo   Successfully pushed to:
    echo   https://github.com/Elite0707/Axiom-AI
    echo ====================================================
    echo.
)

pause
