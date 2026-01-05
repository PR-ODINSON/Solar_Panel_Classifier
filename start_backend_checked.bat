@echo off
setlocal enabledelayedexpansion

echo ================================================
echo   O^&M Module - Backend Server Launcher
echo ================================================
echo.

REM Change to backend directory
cd /d "%~dp0backend"

REM Check Node.js
echo [1/5] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo.
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [OK] Node.js !NODE_VERSION! found

REM Check if port 8000 is available
echo.
echo [2/5] Checking if port 8000 is available...
netstat -ano | findstr ":8000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [WARNING] Port 8000 is already in use!
    echo.
    echo Do you want to kill the process using port 8000? (Y/N)
    choice /C YN /N
    if errorlevel 2 goto skipkill
    
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8000"') do (
        echo Killing process %%a...
        taskkill /PID %%a /F >nul 2>&1
    )
    echo [OK] Port 8000 is now available
    goto portchecked
    
    :skipkill
    echo [WARNING] Starting anyway - may fail if port is in use
) else (
    echo [OK] Port 8000 is available
)

:portchecked

REM Check node_modules
echo.
echo [3/5] Checking dependencies...
if not exist "node_modules" (
    echo [WARNING] node_modules folder not found
    echo Installing dependencies... This may take a few minutes.
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [OK] Dependencies found
)

REM Check .env file
echo.
echo [4/5] Checking configuration...
if not exist ".env" (
    echo [WARNING] .env file not found
    echo Please create a .env file with required configuration
    echo See .env.example for reference
    pause
    exit /b 1
) else (
    echo [OK] Configuration file found
)

REM Start server
echo.
echo [5/5] Starting backend server...
echo ================================================
echo.
echo Server will start on: http://localhost:8000
echo Health check: http://localhost:8000/health
echo.
echo Press Ctrl+C to stop the server
echo ================================================
echo.

REM Start the server
npm start

REM Handle errors
if %errorlevel% neq 0 (
    echo.
    echo ================================================
    echo   [ERROR] Server failed to start
    echo ================================================
    echo.
    echo Possible solutions:
    echo 1. Check if MongoDB connection is working
    echo 2. Verify PORT in .env file
    echo 3. Check server.js for syntax errors
    echo 4. Review the error messages above
    echo.
    echo For more help, check CORS_FIX_PERMANENT.md
    echo.
    pause
    exit /b 1
)

endlocal
