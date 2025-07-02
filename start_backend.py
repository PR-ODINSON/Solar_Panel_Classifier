#!/usr/bin/env python3
"""
Startup script for the Solar Panel Classification Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def check_dependencies():
    """Check if required model files exist"""
    print("🔍 Checking dependencies...")
    
    # Check for model files
    resnet_path = "resnet50_pv_classifier.pth"
    yolo_path = "runs/detect/train_yolo_v8_new_dataset4/weights/best.pt"
    
    missing_files = []
    
    if not os.path.exists(resnet_path):
        missing_files.append(resnet_path)
    
    if not os.path.exists(yolo_path):
        missing_files.append(yolo_path)
    
    if missing_files:
        print("❌ Missing required model files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure model files are in the correct locations.")
        return False
    
    print("✅ All model files found")
    return True

def install_dependencies():
    """Install backend dependencies"""
    print("📦 Installing backend dependencies...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found!")
        return False
    
    requirements_file = backend_dir / "requirements.txt"
    if not requirements_file.exists():
        print("❌ requirements.txt not found in backend directory!")
        return False
    
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file),
            "--trusted-host", "pypi.org",
            "--trusted-host", "files.pythonhosted.org", 
            "--trusted-host", "pypi.python.org"
        ], check=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def start_server():
    """Start the FastAPI server"""
    print("🚀 Starting FastAPI server...")
    
    backend_dir = Path("backend")
    main_file = backend_dir / "main.py"
    
    if not main_file.exists():
        print("❌ main.py not found in backend directory!")
        return False
    
    try:
        # Change to backend directory and start server
        os.chdir(str(backend_dir))
        subprocess.run([sys.executable, "main.py"], check=True)
    except subprocess.CalledProcessError:
        print("❌ Failed to start server")
        return False
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        return True

def main():
    """Main startup routine"""
    print("🌞 Solar Panel Classification Backend Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("backend") or not os.path.exists("frontend"):
        print("❌ Please run this script from the project root directory")
        print("   (The directory containing both 'backend' and 'frontend' folders)")
        sys.exit(1)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Install Python dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Start server
    print("\n" + "=" * 50)
    print("🌐 Server will be available at: http://localhost:8000")
    print("📖 API documentation at: http://localhost:8000/docs")
    print("⚡ Make sure to start the frontend with: cd frontend && npm start")
    print("=" * 50)
    
    start_server()

if __name__ == "__main__":
    main() 