# Setup Instructions for O&M Module Frontend

## Quick Setup Guide

### Step 1: Install Dependencies
```bash
cd "D:\O-M Module\frontend"
npm install
```

### Step 2: Start the Development Server
```bash
npm run dev
```

### Step 3: Access the Application
Open your browser and navigate to: `http://localhost:3000`

### Step 4: Login with Demo Credentials

**For Admin Dashboard:**
- Username: `admin`
- Password: `admin123`

**For Maintenance Dashboard:**
- Username: `maintenance`
- Password: `maintenance123`

## What You'll See

### Admin User Experience
1. **Login Page** with demo credential buttons
2. **Admin Dashboard** with system overview:
   - Total panels, active panels, defective panels
   - Energy loss metrics
   - Quick actions for Upload, Inspections, Defects, Analytics
   - Recent alerts and system overview
3. **Navigation** to Upload-Infer (Admin only), Inspections, Defects, Analytics, Settings

### Maintenance Staff Experience  
1. **Login Page** with demo credential buttons
2. **Maintenance Dashboard** with task-focused view:
   - Pending tasks, completed tasks, critical issues
   - Assigned panels overview
   - Recent tasks with priority levels
   - Upcoming inspections
   - Quick action buttons
3. **Navigation** to Inspections, Defects, Analytics, Settings (no Upload-Infer access)

## Key Features Demonstrated

✅ **Working Features:**
- Role-based authentication and authorization
- Protected routes that redirect based on user role
- Responsive layout with sidebar navigation
- Dark/light mode toggle (persistent)
- Mock dashboard data and APIs
- Professional UI with Tailwind CSS
- Loading states and error handling

🚧 **Placeholder Pages:**
- Inspections, Defects, Analytics, Upload-Infer, Settings
- These show placeholder content and will be implemented in next steps

## Backend Connection

The frontend is configured to connect to the Python backend at `http://localhost:8000`:

- **Working Endpoint**: `/process-upload` for image processing
- **Mock Endpoints**: Authentication and data APIs (will be replaced with real backend endpoints)

## Troubleshooting

### Common Issues and Solutions

#### 1. Icon Import Errors
**Error**: `does not provide an export named 'ShieldX'`
**Solution**: Fixed! We've replaced non-existent lucide-react icons with valid ones.

#### 2. Dynamic Tailwind Classes Not Working
**Error**: Colors not showing properly
**Solution**: Fixed! We've replaced dynamic Tailwind classes with explicit conditionals.

#### 3. Port Issues
If port 3000 is busy, Vite will automatically suggest an alternative port.

#### 4. Backend Connection
If the backend isn't running, authentication will still work with mock data, but file upload features will fail.

#### 5. Node Version
Ensure you're using Node.js 16+ for compatibility.

#### 6. Dependencies Issues
If you encounter dependency issues:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 7. Verify Setup
Run the setup verification script:
```bash
node test-setup.js
```

## Next Steps

After confirming the basic setup works:

1. **Implement Inspections pages** with data tables and filters
2. **Build Defects management** with CRUD operations  
3. **Create Upload-Infer page** with file upload and progress tracking
4. **Add Analytics page** with charts using Recharts
5. **Build Settings page** with role-based views
6. **Add remaining components** (MapView, Heatmap, Modal, etc.)

The foundation is complete and ready for feature development!
