@echo off
title PathQuest AI
echo ============================================
echo   PathQuest AI — Starting...
echo ============================================
echo.

echo Starting FastAPI backend on http://localhost:8000 ...
start "PathQuest Backend" cmd /k "cd /d "%~dp0backend" && uvicorn main:app --reload --port 8000"

timeout /t 2 /nobreak >nul

echo Starting Next.js frontend on http://localhost:3000 ...
start "PathQuest Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ============================================
echo   Backend:  http://localhost:8000
echo   Frontend: http://localhost:3000
echo   API Docs: http://localhost:8000/docs
echo ============================================
echo.
echo Opening browser...
start http://localhost:3000
