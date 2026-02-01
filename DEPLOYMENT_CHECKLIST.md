# Deployment Checklist - Solar Panel O&M Module

## Required Files and Folders

### 1. Backend Files
```
backend/
├── server.js                          # Main Node.js server
├── main.py                            # Python FastAPI server (if using)
├── package.json                       # Node.js dependencies
├── requirements.txt                   # Python dependencies
├── config/
│   └── database.js                    # Database configuration
├── middleware/
│   └── auth.js                        # Authentication middleware
├── models/                            # MongoDB models
│   ├── User.js
│   ├── Defect.js
│   ├── Inspection.js
│   ├── MaintenanceTask.js
│   └── Panel.js
├── routes/                            # API routes
│   ├── auth.js
│   ├── defects.js
│   ├── inspections.js
│   └── [other route files]
├── services/
│   └── SolarPanelProcessor.js         # Image processing service
└── python_scripts/                    # Python ML scripts
    ├── yolo_detection.py              # YOLO detection script
    └── panel_classification.py        # ResNet classification script
```

### 2. Frontend Files
```
frontend/
├── package.json                       # Frontend dependencies
├── vite.config.js                     # Vite configuration
├── tailwind.config.js                 # Tailwind CSS config
├── index.html                         # Main HTML file
├── src/
│   ├── main.jsx                       # Entry point
│   ├── App.jsx                        # Main app component
│   ├── api/
│   │   └── apiClient.js              # API client configuration
│   ├── components/                    # React components
│   ├── pages/                         # Page components
│   │   └── admin/
│   │       └── UploadInfer.jsx       # Upload & inference page
│   ├── context/                       # React contexts
│   │   └── AuthContext.jsx
│   └── hooks/                         # Custom hooks
│       └── useToast.js
└── public/                            # Static assets
```

### 3. Model Files (CRITICAL - Large Files)
```
runs/detect/train_yolo_v8_new_dataset4/weights/
└── best.pt                            # YOLO model weights (~6MB)

resnet50_pv_classifier.pth             # ResNet classifier (~100MB)
```

### 4. Configuration Files
```
.env                                   # Environment variables (create from template below)
DATABASE_CONFIG.md                     # Database setup documentation
```

### 5. Temporary Directories (Auto-created)
These will be created automatically by the application:
```
uploads/                               # Uploaded images
outputs/                               # Processed outputs
temp_tiles/                            # Temporary tiles
temp_annotated/                        # Annotated tiles
temp_boxes/                            # Detection boxes
```

---

## Environment Variables (.env)

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/solar-panel-om
DB_NAME=solar-panel-om

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Python Configuration
PYTHON_PATH=python
```

---

## Dependencies to Install

### Backend (Node.js)
```bash
cd backend
npm install
```

**Key packages:**
- express
- multer (file uploads)
- cors
- mongoose (MongoDB)
- jsonwebtoken
- bcryptjs
- dotenv

### Backend (Python)
```bash
cd backend
pip install -r requirements.txt
```

**Key packages:**
- ultralytics (YOLO)
- torch torchvision (PyTorch)
- opencv-python
- numpy
- pandas
- pillow
- openpyxl
- fastapi (if using main.py)

### Frontend
```bash
cd frontend
npm install
```

**Key packages:**
- react
- react-router-dom
- lucide-react (icons)
- tailwindcss
- vite

---

## MongoDB Setup

Ensure MongoDB is installed and running:
```bash
# Check if MongoDB is running
mongosh

# Or start MongoDB service
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl start mongod
```

---

## Deployment Steps

### 1. Transfer Files
Transfer these files/folders to the target PC:
- ✅ All backend files
- ✅ All frontend files  
- ✅ Model files (best.pt and resnet50_pv_classifier.pth)
- ✅ Configuration files

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 3. Configure Environment
- Create `.env` file with proper configuration
- Update MongoDB connection string
- Set JWT secret

### 4. Verify Model Paths
Ensure these paths are correct in `backend/services/SolarPanelProcessor.js`:
```javascript
this.yoloModelPath = path.join(PROJECT_ROOT, 'runs/detect/train_yolo_v8_new_dataset4/weights/best.pt');
this.classifierPath = path.join(PROJECT_ROOT, 'resnet50_pv_classifier.pth');
```

### 5. Start Services

**Backend:**
```bash
cd backend
node server.js
# or
npm start
```

**Frontend:**
```bash
cd frontend
npm run dev
# For production:
npm run build
npm run preview
```

---

## Troubleshooting

### Issue: Model files not found
- Verify model files exist at correct paths
- Check file permissions

### Issue: Python script errors
- Ensure Python 3.8+ is installed
- Verify all Python packages are installed
- Check Python is in system PATH

### Issue: MongoDB connection failed
- Verify MongoDB is running
- Check connection string in .env
- Ensure database user has proper permissions

### Issue: YOLO output in JSON
- This should be fixed with the latest code updates
- Verify python_scripts/yolo_detection.py has all logging suppressions

---

## Production Considerations

1. **Use PM2** for Node.js process management:
```bash
npm install -g pm2
pm2 start backend/server.js --name solar-panel-backend
pm2 startup
pm2 save
```

2. **Use Nginx** as reverse proxy for production

3. **Set up proper SSL/TLS** certificates

4. **Configure firewall** rules

5. **Set up automated backups** for MongoDB

6. **Monitor logs** and system resources

---

## File Size Summary
- Backend code: ~10MB
- Frontend code: ~5MB
- YOLO model: ~6MB
- ResNet model: ~100MB
- **Total: ~121MB** (excluding node_modules)
