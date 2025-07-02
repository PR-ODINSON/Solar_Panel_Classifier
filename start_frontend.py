#!/usr/bin/env python3
"""
Startup script for the Solar Panel Classification Frontend
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def clean_installation():
    """Clean previous npm installation"""
    print("🧹 Cleaning previous installation...")
    
    # Remove node_modules if it exists
    node_modules = Path("node_modules")
    if node_modules.exists():
        print("   Removing node_modules...")
        shutil.rmtree(node_modules, ignore_errors=True)
    
    # Remove package-lock.json if it exists
    package_lock = Path("package-lock.json")
    if package_lock.exists():
        print("   Removing package-lock.json...")
        package_lock.unlink()
    
    # Clear npm cache
    try:
        subprocess.run(["npm", "cache", "clean", "--force"], check=False)
        print("   npm cache cleared")
    except:
        print("   Could not clear npm cache (continuing anyway)")

def install_dependencies():
    """Install frontend dependencies"""
    print("📦 Installing frontend dependencies...")
    
    # Try normal installation first
    try:
        result = subprocess.run(["npm", "install"], check=True, capture_output=True, text=True)
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print("⚠️  Normal installation failed, trying with --legacy-peer-deps...")
        
        # Try with legacy peer deps
        try:
            result = subprocess.run(["npm", "install", "--legacy-peer-deps"], check=True, capture_output=True, text=True)
            print("✅ Dependencies installed successfully (with legacy peer deps)")
            return True
        except subprocess.CalledProcessError as e2:
            print("❌ Failed to install dependencies")
            print(f"Error: {e2.stderr}")
            return False

def start_server():
    """Start the React development server"""
    print("🚀 Starting React development server...")
    
    # Method 1: Try npx react-scripts start
    print("   Attempting method 1: npx react-scripts start")
    try:
        subprocess.run(["npx", "react-scripts", "start"], check=True)
        return True
    except subprocess.CalledProcessError:
        print("   Method 1 failed")
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        return True
    
    # Method 2: Try npm start
    print("   Attempting method 2: npm start")
    try:
        subprocess.run(["npm", "start"], check=True)
        return True
    except subprocess.CalledProcessError:
        print("   Method 2 failed")
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        return True
    
    # Method 3: Try direct node execution
    print("   Attempting method 3: direct node execution")
    try:
        react_scripts_path = Path("node_modules/react-scripts/bin/react-scripts.js")
        if react_scripts_path.exists():
            subprocess.run(["node", str(react_scripts_path), "start"], check=True)
            return True
        else:
            print("   react-scripts.js not found")
    except subprocess.CalledProcessError:
        print("   Method 3 failed")
    except KeyboardInterrupt:
        print("\n⏹️ Server stopped by user")
        return True
    
    print("❌ All startup methods failed")
    return False

def main():
    """Main startup routine"""
    print("⚛️  Solar Panel Classification Frontend Startup")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists("../backend") or not os.path.exists("package.json"):
        print("❌ Please run this script from the frontend directory")
        print("   Or ensure you're in the project root and run: cd frontend && python ../start_frontend.py")
        sys.exit(1)
    
    # Check for Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True, check=True)
        node_version = result.stdout.strip()
        print(f"✅ Node.js found: {node_version}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Node.js not found. Please install Node.js 16+ from https://nodejs.org/")
        sys.exit(1)
    
    # Check for npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True, check=True)
        npm_version = result.stdout.strip()
        print(f"✅ npm found: v{npm_version}")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ npm not found. Please install npm")
        sys.exit(1)
    
    # Clean previous installation
    clean_installation()
    
    # Install dependencies
    if not install_dependencies():
        sys.exit(1)
    
    # Start server
    print("\n" + "=" * 50)
    print("🌐 Frontend will be available at: http://localhost:3000")
    print("🔗 Make sure backend is running at: http://localhost:8000")
    print("=" * 50)
    
    if not start_server():
        print("\n💡 Manual startup options:")
        print("   1. cd frontend && npx react-scripts start")
        print("   2. cd frontend && npm run start-clean")
        print("   3. cd frontend && node node_modules/react-scripts/bin/react-scripts.js start")
        sys.exit(1)

if __name__ == "__main__":
    main() 