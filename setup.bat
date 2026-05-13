@echo off
title PathQuest AI — Setup
echo ============================================
echo   PathQuest AI — First-time Setup
echo ============================================
echo.

echo [1/4] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Python not found!
    echo  Please install Python 3.10+ from https://python.org/downloads
    echo  Make sure to check "Add Python to PATH" during install.
    pause
    exit /b 1
)
python --version

echo.
echo [2/4] Installing Python dependencies...
cd /d "%~dp0backend"
pip install -r requirements.txt
if errorlevel 1 (
    echo  ERROR: pip install failed
    pause
    exit /b 1
)

echo.
echo [3/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js not found!
    echo  Please install Node.js LTS from https://nodejs.org
    pause
    exit /b 1
)
node --version

echo.
echo [4/4] Installing frontend dependencies...
cd /d "%~dp0frontend"
npm install
if errorlevel 1 (
    echo  ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Setup complete! Run start.bat to launch.
echo ============================================
pause
