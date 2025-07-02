@echo off
setlocal enabledelayedexpansion

echo Solar Panel Classification Frontend Startup
echo ==================================================
echo.

:: Check if we're in the right directory
if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Navigate to frontend directory
cd frontend

:: Check if package.json exists
if not exist "package.json" (
    echo ERROR: package.json not found in frontend directory!
    pause
    exit /b 1
)

:: Clean npm cache and remove node_modules if they exist
echo Cleaning previous installation...
if exist "node_modules" (
    echo Removing existing node_modules...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del package-lock.json
)

:: Clear npm cache
echo Clearing npm cache...
npm cache clean --force

:: Install dependencies
echo Installing frontend dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    echo Trying alternative installation method...
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ERROR: Installation failed with both methods
        pause
        exit /b 1
    )
)

echo.
echo Dependencies installed successfully!
echo.
echo ==================================================
echo Frontend will be available at: http://localhost:3000
echo Make sure the backend is running at: http://localhost:8000
echo ==================================================
echo.
echo Starting React development server...

:: Try different start methods
echo Attempting to start with npx...
npx react-scripts start
if errorlevel 1 (
    echo.
    echo First method failed, trying alternative...
    npm run start-clean
    if errorlevel 1 (
        echo.
        echo Both methods failed. Trying manual start...
        node node_modules/react-scripts/bin/react-scripts.js start
    )
)

pause 