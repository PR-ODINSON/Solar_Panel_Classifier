@echo off
echo Solar Panel Classification Backend Startup
echo ==================================================
echo.

:: Check if we're in the right directory
if not exist "backend" (
    echo ERROR: backend directory not found!
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

:: Check for model files
echo Checking for model files...
if not exist "resnet50_pv_classifier.pth" (
    echo ERROR: resnet50_pv_classifier.pth not found!
    echo Please ensure model files are in the correct locations.
    pause
    exit /b 1
)

if not exist "runs\detect\train_yolo_v8_new_dataset4\weights\best.pt" (
    echo ERROR: YOLO model weights not found!
    echo Please ensure model files are in the correct locations.
    pause
    exit /b 1
)

echo Model files found!
echo.

:: Install dependencies
echo Installing backend dependencies...
cd backend
pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org --trusted-host pypi.python.org
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.
echo ==================================================
echo Server will be available at: http://localhost:8000
echo API documentation at: http://localhost:8000/docs
echo Make sure to start the frontend with: cd frontend ^&^& npm start
echo ==================================================
echo.
echo Starting FastAPI server...

:: Start the server
python main.py

pause 