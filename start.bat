@echo off
echo ===================================================
echo Starting NEXUS Platform...
echo ===================================================

echo Starting Backend (FastAPI)...
start cmd /k "title NEXUS Backend (FastAPI) && cd backend && pip install -r requirements.txt && python main.py"

echo Starting Frontend (Next.js)...
start cmd /k "title NEXUS Frontend (Next.js) && cd frontend && npm run dev"

echo.
echo Both servers are starting up in separate windows!
echo - Backend API will be available at: http://127.0.0.1:8000
echo - Frontend UI will be available at: http://localhost:3000
echo.
pause
