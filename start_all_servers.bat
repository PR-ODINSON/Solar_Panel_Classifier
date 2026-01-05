@echo off
echo ================================================
echo   O^&M Module - Complete System Startup
echo ================================================
echo.
echo This will start both Backend and Frontend servers
echo.

REM Start backend in new window
echo Starting Backend Server...
start "O&M Backend (Port 8000)" cmd /k "cd /d "%~dp0" && start_backend_checked.bat"

REM Wait a bit for backend to initialize
echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend Server...
start "O&M Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo ================================================
echo   Both servers are starting...
echo ================================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Check the separate windows for server logs
echo Close those windows to stop the servers
echo.
pause
