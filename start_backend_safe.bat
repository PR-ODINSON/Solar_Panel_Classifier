@echo off
echo ================================================
echo   Starting O&M Module Backend Server
echo ================================================
echo.

cd /d "%~dp0backend"

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Checking MongoDB connection...
echo.

echo Starting backend server...
echo Press Ctrl+C to stop the server
echo.

npm start

if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo   ERROR: Server failed to start
    echo ================================================
    echo.
    echo Possible issues:
    echo 1. MongoDB connection failed
    echo 2. Port 8000 is already in use
    echo 3. Missing dependencies - run: npm install
    echo.
    pause
    exit /b 1
)
