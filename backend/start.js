#!/usr/bin/env node

/**
 * Startup script for Solar Panel Classification Backend
 * This script handles environment setup and graceful startup
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌞 Solar Panel Classification Backend');
console.log('=====================================');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 16) {
    console.error('❌ Node.js version 16 or higher is required');
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
}

console.log(`✅ Node.js version: ${nodeVersion}`);

// Check Python availability
import { spawn } from 'child_process';

function checkPython() {
    return new Promise((resolve) => {
        const python = spawn('python', ['--version']);
        python.on('close', (code) => {
            if (code === 0) {
                resolve(true);
            } else {
                // Try python3
                const python3 = spawn('python3', ['--version']);
                python3.on('close', (code3) => {
                    resolve(code3 === 0);
                });
            }
        });
        python.on('error', () => {
            resolve(false);
        });
    });
}

// Check required directories
async function checkDirectories() {
    const requiredDirs = [
        'uploads',
        'outputs', 
        'temp_tiles',
        'temp_annotated',
        'temp_boxes',
        'python_scripts'
    ];
    
    console.log('📁 Checking directories...');
    
    for (const dir of requiredDirs) {
        const dirPath = path.join(__dirname, dir);
        await fs.ensureDir(dirPath);
        console.log(`   ✅ ${dir}`);
    }
}

// Check required models
async function checkModels() {
    console.log('🧠 Checking ML models...');
    
    const projectRoot = path.resolve(__dirname, '../');
    const classifierPath = path.join(projectRoot, 'resnet50_pv_classifier.pth');
    const yoloPath = path.join(projectRoot, 'runs', 'detect', 'train_yolo_v8_new_dataset4', 'weights', 'best.pt');
    
    const classifierExists = await fs.pathExists(classifierPath);
    const yoloExists = await fs.pathExists(yoloPath);
    
    if (classifierExists) {
        console.log('   ✅ ResNet Classifier model found');
    } else {
        console.log('   ⚠️  ResNet Classifier model not found');
        console.log(`      Expected at: ${classifierPath}`);
    }
    
    if (yoloExists) {
        console.log('   ✅ YOLO model found');
    } else {
        console.log('   ⚠️  YOLO model not found');
        console.log(`      Expected at: ${yoloPath}`);
    }
    
    if (!classifierExists || !yoloExists) {
        console.log('');
        console.log('⚠️  Some models are missing. The server will start but');
        console.log('   ML processing may fail until models are available.');
        console.log('');
    }
    
    return { classifier: classifierExists, yolo: yoloExists };
}

// Main startup function
async function startup() {
    try {
        // Check Python
        const pythonAvailable = await checkPython();
        if (pythonAvailable) {
            console.log('✅ Python is available');
        } else {
            console.log('⚠️  Python not found in PATH');
            console.log('   ML processing will require Python to be installed');
        }
        
        // Check directories
        await checkDirectories();
        
        // Check models
        const models = await checkModels();
        
        console.log('');
        console.log('🚀 Starting server...');
        console.log('');
        
        // Import and start the server
        const app = await import('./server.js');
        
    } catch (error) {
        console.error('❌ Startup failed:', error.message);
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the application
startup();
