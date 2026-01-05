import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import SolarPanelProcessor from './services/SolarPanelProcessor.js';
import connectDB from './config/database.js';
import { createRequire } from 'module';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import inspectionRoutes from './routes/inspections.js';
import defectRoutes from './routes/defects.js';
import maintenanceRoutes from './routes/maintenance.js';
import panelRoutes from './routes/panels.js';

// Load environment variables
dotenv.config();

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        success: false
    }
});
app.use('/api/', limiter);

// CORS middleware - Comprehensive configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or same-origin)
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173'
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            // In development, allow all origins
            if (process.env.NODE_ENV === 'development') {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86400 // Cache preflight requests for 24 hours
};

app.use(cors(corsOptions));

// Additional CORS headers middleware for extra safety
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Expose-Headers', 'Content-Range, X-Content-Range');
    
    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Handle preflight requests explicitly for all routes
app.options('*', cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        next();
    });
}

// Constants
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const OUTPUT_DIR = path.join(__dirname, 'outputs');
const TILE_SIZE = 512;
const TILE_DIR = path.join(__dirname, 'temp_tiles');
const ANNOTATED_DIR = path.join(__dirname, 'temp_annotated');
const BOXES_DIR = path.join(__dirname, 'temp_boxes');

// Setup directories
const directories = [UPLOAD_DIR, OUTPUT_DIR, TILE_DIR, ANNOTATED_DIR, BOXES_DIR];
directories.forEach(dir => {
    fs.ensureDirSync(dir);
});

// Mount static files for outputs
app.use('/outputs', express.static(OUTPUT_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // Keep original filename
        cb(null, file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG and PNG files are allowed'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Initialize processor
const processor = new SolarPanelProcessor({
    uploadDir: UPLOAD_DIR,
    outputDir: OUTPUT_DIR,
    tileDir: TILE_DIR,
    annotatedDir: ANNOTATED_DIR,
    boxesDir: BOXES_DIR,
    tileSize: TILE_SIZE
});

// Progress tracking for batch processing
const processingProgress = new Map();

// API Routes - Authentication and User Management
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/panels', panelRoutes);

// Legacy Solar Panel Processing Routes

/**
 * Health check endpoint
 */
app.get('/health', async (req, res) => {
    try {
        const modelStatus = await processor.checkModelsStatus();
        res.json({
            status: 'healthy',
            models_loaded: modelStatus.allLoaded,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Process uploaded images
 */
app.post('/process-upload', upload.array('files'), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                error: 'No files uploaded',
                success: false
            });
        }

        console.log(`Processing ${req.files.length} files...`);
        const results = [];
        const batchId = Date.now().toString();
        
        // Initialize progress tracking
        processingProgress.set(batchId, {
            total: req.files.length,
            completed: 0,
            results: [],
            startTime: new Date()
        });

        for (let i = 0; i < req.files.length; i++) {
            const file = req.files[i];
            try {
                console.log(`Processing file ${i + 1}/${req.files.length}: ${file.filename}`);
                
                // Update progress
                const progress = processingProgress.get(batchId);
                progress.current_file = file.filename;
                progress.current_step = 'Processing';
                
                const result = await processor.processImage(file.path, file.filename);
                
                const fileResult = {
                    filename: file.filename,
                    success: true,
                    ...result
                };
                
                results.push(fileResult);
                
                // Update progress
                progress.completed++;
                progress.results.push(fileResult);
                
                console.log(`Successfully processed: ${file.filename} (${i + 1}/${req.files.length})`);
            } catch (error) {
                console.error(`Error processing ${file.filename}:`, error.message);
                const fileResult = {
                    filename: file.filename,
                    success: false,
                    error: error.message
                };
                
                results.push(fileResult);
                
                // Update progress
                const progress = processingProgress.get(batchId);
                progress.completed++;
                progress.results.push(fileResult);
            }
        }
        
        // Mark batch as complete
        const progress = processingProgress.get(batchId);
        progress.completed_time = new Date();
        progress.current_step = 'Complete';
        
        // Clean up progress after 1 hour
        setTimeout(() => {
            processingProgress.delete(batchId);
        }, 3600000);

        res.json({
            batch_id: batchId,
            results: results,
            total_files: req.files.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            processing_time: progress.completed_time - progress.startTime
        });

    } catch (error) {
        console.error('Error in process-upload:', error);
        res.status(500).json({
            error: error.message,
            success: false
        });
    }
});

/**
 * Get batch processing progress
 */
app.get('/batch-progress/:batchId', async (req, res) => {
    try {
        const batchId = req.params.batchId;
        const progress = processingProgress.get(batchId);
        
        if (!progress) {
            return res.status(404).json({
                error: 'Batch not found or expired',
                success: false
            });
        }
        
        res.json({
            batch_id: batchId,
            total: progress.total,
            completed: progress.completed,
            current_file: progress.current_file,
            current_step: progress.current_step,
            percentage: Math.round((progress.completed / progress.total) * 100),
            is_complete: progress.completed >= progress.total,
            start_time: progress.startTime,
            completed_time: progress.completed_time,
            results: progress.results
        });
        
    } catch (error) {
        console.error('Error getting batch progress:', error);
        res.status(500).json({
            error: error.message,
            success: false
        });
    }
});

/**
 * Download generated files
 */
app.get('/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(OUTPUT_DIR, filename);
        
        // Check if file exists
        if (!await fs.pathExists(filePath)) {
            return res.status(404).json({
                error: 'File not found',
                filename: filename
            });
        }

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        // Send file
        res.sendFile(filePath);
        
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * Get list of output files
 */
app.get('/outputs', async (req, res) => {
    try {
        const files = await fs.readdir(OUTPUT_DIR);
        const fileList = [];
        
        for (const file of files) {
            const filePath = path.join(OUTPUT_DIR, file);
            const stats = await fs.stat(filePath);
            
            fileList.push({
                name: file,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                type: path.extname(file).toLowerCase()
            });
        }
        
        res.json({
            files: fileList.sort((a, b) => b.modified - a.modified)
        });
        
    } catch (error) {
        console.error('Error listing output files:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

/**
 * Clean up temporary files
 */
app.post('/cleanup', async (req, res) => {
    try {
        await processor.clearTemporaryDirectories();
        res.json({
            success: true,
            message: 'Temporary files cleaned up successfully'
        });
    } catch (error) {
        console.error('Error cleaning up:', error);
        res.status(500).json({
            error: error.message,
            success: false
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    // Ensure CORS headers are set even on errors
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large. Maximum size is 100MB.',
                success: false
            });
        }
    }
    
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        success: false,
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// 404 handler
app.use('*', (req, res) => {
    // Ensure CORS headers are set even on 404
    res.header('Access-Control-Allow-Origin', req.headers.origin || 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.originalUrl
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Solar Panel Classification Server running on http://localhost:${PORT}`);
    console.log(`📁 Upload directory: ${UPLOAD_DIR}`);
    console.log(`📁 Output directory: ${OUTPUT_DIR}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down server...');
    try {
        await processor.cleanup();
        console.log('✅ Cleanup completed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Don't exit the process, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    // Don't exit the process, just log the error
});

export default app;
