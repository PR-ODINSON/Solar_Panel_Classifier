# Solar Panel Classification System

A web application for detecting and classifying solar panel conditions using drone imagery.

## Features

- React frontend with drag-and-drop file upload
- FastAPI backend with YOLO detection + ResNet classification
- Excel report generation with detailed statistics
- Annotated images with bounding boxes and labels

## Classification Categories

- 🟢 **Clean**: Panels in good condition
- 🟡 **Dusty**: Panels with dust accumulation  
- 🟠 **Bird-drop**: Panels with bird droppings
- 🔴 **Physical-Damage**: Panels with physical damage

## Quick Start

### Option 1: Automated Startup (Recommended)

**Backend:**
```bash
python start_backend.py
# or on Windows: start_backend.bat
```

**Frontend:**
```bash
cd frontend
python ../start_frontend.py
# or on Windows: ..\start_frontend.bat
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
pip install -r requirements.txt --trusted-host pypi.org --trusted-host files.pythonhosted.org --trusted-host pypi.python.org
python main.py
```

**Frontend:**
```bash
cd frontend
npm cache clean --force
npm install --legacy-peer-deps
npx react-scripts start
```

Then open http://localhost:3000 in your browser.

## Usage

1. Upload drone images (JPG, PNG) via drag-and-drop
2. Click "Process Images" 
3. View annotated results and download Excel reports

## Requirements

- Python 3.8+ with PyTorch, OpenCV, FastAPI
- Node.js 16+ with React
- Model files: resnet50_pv_classifier.pth and YOLO weights

The system processes images by tiling, detecting panels with YOLO, classifying conditions with ResNet, and generating comprehensive reports. 