# Database Configuration Documentation

## ✅ Current Configuration

### MongoDB Atlas Connection
- **Database Provider**: MongoDB Atlas (Cloud)
- **Connection String**: `mongodb+srv://prithraj120_db_user:***@cluster0.qmk1zke.mongodb.net/`
- **Database Name**: `solar_panel_om`
- **Environment**: Development

### Configuration Files

#### 1. Backend Environment Variables (`.env`)
```env
MONGODB_URI=mongodb+srv://prithraj120_db_user:0Nz4RQDSzrOsbayp@cluster0.qmk1zke.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
DB_NAME=solar_panel_om
PORT=8000
NODE_ENV=development
```

#### 2. Database Connection (`backend/config/database.js`)
- Uses `process.env.MONGODB_URI` and `process.env.DB_NAME`
- Single connection point for entire application
- Automatic reconnection on disconnect
- Graceful shutdown handling

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Port 3000)                     │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ React Pages  │──────▶│  API Client  │                    │
│  └──────────────┘      └──────────────┘                    │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 │ HTTP Requests
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Port 8000)                      │
│                                                               │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ Express API  │──────▶│ Mongoose ORM │                    │
│  └──────────────┘      └──────────────┘                    │
└────────────────────────────────┬────────────────────────────┘
                                 │
                                 │ MongoDB Wire Protocol
                                 ▼
┌─────────────────────────────────────────────────────────────┐
│              MongoDB Atlas (Cloud Database)                  │
│                                                               │
│  Database: solar_panel_om                                    │
│  ├── users                                                   │
│  ├── inspections                                             │
│  ├── defects                                                 │
│  ├── panels                                                  │
│  └── maintenancetasks                                        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Files Using Database Connection

### Backend Core Files
1. **`backend/server.js`**
   - Entry point for Express server
   - Calls `connectDB()` on startup
   - Port: 8000

2. **`backend/config/database.js`**
   - Central database connection handler
   - Uses environment variables
   - Handles connection events and errors

### API Routes
All routes use authenticated Mongoose queries:
- **`backend/routes/auth.js`** - User authentication
- **`backend/routes/users.js`** - User management
- **`backend/routes/inspections.js`** - Inspection CRUD
- **`backend/routes/defects.js`** - Defect CRUD
- **`backend/routes/maintenance.js`** - Maintenance task CRUD
- **`backend/routes/panels.js`** - Panel CRUD + AI processing

### Database Models
All models use Mongoose schemas:
- **`backend/models/User.js`**
- **`backend/models/Inspection.js`**
- **`backend/models/Defect.js`**
- **`backend/models/Panel.js`**
- **`backend/models/MaintenanceTask.js`**

### Utility Scripts
All scripts use `connectDB()` or environment variables:
- **`backend/scripts/seedDatabase.js`** - Populate sample data
- **`backend/scripts/createAdminUser.js`** - Create admin user
- **`backend/scripts/clearAllData.js`** - Clear all collections
- **`backend/scripts/checkUsers.js`** - List all users
- **`backend/scripts/checkTasksAndDefects.js`** - Verify data integrity
- **`backend/check-user.js`** - Check specific user
- **`backend/create-prithvi-user.js`** - Create Prithvi user
- **`backend/fetch-all-data.js`** - Display all database contents
- **`backend/fix-prithvi-user.js`** - Update Prithvi user

### Frontend Configuration
- **`frontend/src/config/api.js`**
  - Base URL: `http://localhost:8000`
  - Timeout: 30 seconds
  - All API calls route through backend server

## 🔒 Security Checklist

### ✅ Current Security Measures
- [x] Database credentials stored in `.env` (not committed to Git)
- [x] Password masked in console logs
- [x] MongoDB Atlas IP whitelist enabled
- [x] JWT authentication for API routes
- [x] Rate limiting on API endpoints
- [x] CORS configuration restricted
- [x] Helmet.js security headers
- [x] bcrypt password hashing

### ⚠️ Production Recommendations
- [ ] Move to production MongoDB cluster
- [ ] Enable MongoDB Atlas backup
- [ ] Set up monitoring and alerts
- [ ] Use environment-specific .env files
- [ ] Implement database connection pooling limits
- [ ] Enable MongoDB audit logs
- [ ] Rotate database credentials regularly
- [ ] Use separate read/write users

## 🧪 Verification Commands

### 1. Verify Database Configuration
```bash
cd backend
node verify-database-config.js
```

### 2. Check Current Database Contents
```bash
cd backend
node fetch-all-data.js
```

### 3. Test Database Connection
```bash
cd backend
node -e "import('dotenv').then(d => { d.default.config(); console.log('DB:', process.env.DB_NAME); })"
```

### 4. Check User Count
```bash
cd backend
node check-user.js
```

## 🚫 What NOT to Do

### ❌ Never Use Multiple Database Connections
```javascript
// ❌ WRONG - Don't create new connections
mongoose.createConnection('mongodb://other-db')

// ✅ CORRECT - Use existing connection
import connectDB from './config/database.js'
await connectDB()
```

### ❌ Never Hardcode Connection Strings
```javascript
// ❌ WRONG
mongoose.connect('mongodb://localhost:27017/mydb')

// ✅ CORRECT
mongoose.connect(process.env.MONGODB_URI, {
  dbName: process.env.DB_NAME
})
```

### ❌ Never Commit Credentials to Git
```javascript
// ❌ WRONG - .env file with credentials in Git
# .env should be in .gitignore

// ✅ CORRECT - Use .env.example as template
# .env.example (template only, no real credentials)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=your_database_name
```

## 📊 Current Database Statistics

### Collections
- **users**: 2 documents
  - ai-system (admin)
  - prithvi (maintenance_staff - EMP001)

- **inspections**: 2 documents
  - INS261395175 (Jan 19, 2026)
  - INS926615297 (Jan 21, 2026)

- **defects**: 4 documents
  - DEF000001 (crack - high severity)
  - DEF000002 (soiling - medium severity)
  - DEF000003 (crack - high severity)
  - DEF000004 (soiling - medium severity)

- **panels**: 0 documents
- **maintenancetasks**: 0 documents

### Health Check
Last verified: January 21, 2026
Status: ✅ All systems operational

## 🔄 Database Migration Guide

### If Moving to Different Database:
1. Update `.env` file with new credentials
2. Run verification: `node verify-database-config.js`
3. Seed data if needed: `node scripts/seedDatabase.js`
4. Verify frontend connectivity
5. Test all API endpoints

### Backup Current Database:
```bash
# Using MongoDB Atlas UI
1. Go to MongoDB Atlas Dashboard
2. Select Cluster0
3. Click "..." → "Export Data"
4. Choose collections and download

# Or use mongodump
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/solar_panel_om"
```

## 📞 Support

### MongoDB Atlas Dashboard
https://cloud.mongodb.com/

### Connection Issues
1. Check IP whitelist in Atlas
2. Verify credentials in .env
3. Test network connectivity
4. Check MongoDB Atlas status page

### For Development Issues
Run diagnostics:
```bash
cd backend
node verify-database-config.js
```

---

**Last Updated**: January 21, 2026  
**Maintained By**: Development Team  
**Database Version**: MongoDB 6.0+  
**Mongoose Version**: 8.0+
