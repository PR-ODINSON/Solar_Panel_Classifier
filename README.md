# Solar Panel O&M Module

A comprehensive web application for detecting, classifying, and managing solar panel conditions using drone imagery with role-based access control.

## Features

- **React Frontend** with drag-and-drop file upload and role-based dashboards
- **Node.js Backend** for authentication, user management, and MongoDB operations
- **Python Backend** for YOLO detection + ResNet classification
- Excel report generation with detailed statistics
- Annotated images with bounding boxes and labels
- Admin and Maintenance Staff roles with distinct permissions

## ✨ Key Features

### For Admin Users
- 📊 System dashboard with analytics
- 👥 User management (create maintenance staff)
- 📋 Task assignment and tracking
- 🖼️ Image upload and AI-powered defect detection
- 📈 Reports and analytics

### For Maintenance Staff
- 📝 View assigned tasks
- 📸 **Add observations with image upload** (up to 5 images, 5MB each)
- 💬 Add text notes and updates
- 📅 Track task progress
- 🔍 View task details and history

### Technical Features
- 🔐 JWT authentication with refresh tokens
- 🎨 Dark/Light mode
- 📱 Responsive design
- 🚀 Multer-based file upload
- 🗄️ MongoDB database
- 🔒 Role-based access control

## 🏗️ Architecture

### Backend Services
1. **Node.js/Express (Port 8000)**
   - User authentication & authorization
   - Task management
   - **Observation & image upload handling**
   - MongoDB operations
   
2. **Python/FastAPI (Optional)**
   - AI-powered defect detection
   - Image processing with YOLO & ResNet50

### Database
- MongoDB Atlas
- Collections: users, maintenancetasks, panels, defects, inspections

## 📦 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Multer, JWT
- **AI**: Python, FastAPI, YOLO, ResNet50
- **Security**: Helmet, CORS, Rate Limiting, bcrypt

## 📸 Observation Feature

Maintenance staff can add detailed observations to assigned tasks:

1. Navigate to task details page
2. Click "Add Observation"
3. Enter text description (optional)
4. Upload up to 5 images (5MB each)
5. Preview images before submission
6. Submit observation

**Image Upload:**
- Supported formats: JPEG, PNG, GIF, WEBP
- Max file size: 5MB per image
- Max files: 5 images per observation
- Images stored in: `backend/uploads/observations/`

## 🛠️ Development

### Backend Development
```bash
cd backend
npm run dev    # Auto-restart on changes
```

### Frontend Development
```bash
cd frontend
npm run dev    # Hot reload enabled
```

### Database Scripts
```bash
# Create admin user
npm run create-admin

# Check existing users
npm run check-users

# Clear all data (except users)
node scripts/clearAllData.js
```

## 📁 Project Structure

```
O-M Module/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Authentication
│   │   ├── maintenance.js   # Tasks & observations
│   │   └── users.js         # User management
│   ├── models/
│   │   ├── User.js
│   │   └── MaintenanceTask.js  # With observations
│   ├── uploads/
│   │   └── observations/    # Uploaded images
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── admin/       # Admin pages
│   │   │   └── maintenance/ # Staff pages
│   │   ├── api/
│   │   │   └── apiClient.js # API calls
│   │   └── context/
│   │       └── AuthContext.jsx
│   └── package.json
│
└── README.md
```

## 🔒 Security

- JWT access & refresh tokens
- bcrypt password hashing
- CORS protection
- Rate limiting
- Helmet security headers
- File upload validation
- Role-based authorization

## 📝 API Documentation

See [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for detailed API documentation.

## 🎯 For Internship Review

This project demonstrates:
- Full-stack development (MERN)
- File upload with Multer
- JWT authentication
- Role-based access control
- RESTful API design
- MongoDB schema design
- React hooks and context
- Image preview and validation
- Error handling
- Security best practices

---

**Note**: All test/development documentation files have been removed. Only essential files remain. 