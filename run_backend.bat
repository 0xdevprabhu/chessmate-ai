@echo off
title ChessMate AI - Backend Server
echo Starting ChessMate AI FastAPI Backend on http://127.0.0.1:8000...
cd /d "%~dp0"
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause
