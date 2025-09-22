@echo off
echo Starting O&M Module Servers...

REM Start Backend Server
echo Starting Backend Server (Python FastAPI)...
start "Backend Server" cmd /k "cd backend && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend Server  
echo Starting Frontend Server (React + Vite)...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Both servers starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo Press any key to close this window...
pause >nul
