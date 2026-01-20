# O&M Module Frontend

A modern React frontend for the O&M (Operations & Maintenance) Module - Solar Panel Management System. This application provides role-based access for administrators and maintenance staff to manage solar panel inspections, defects, and analytics.

## Features

### Authentication & Authorization
- Role-based access control (Admin / Maintenance Staff)
- JWT token authentication
- Protected routes with automatic redirects
- Session management with token refresh

### Admin Features
- **Dashboard**: System overview with total panels, defective count, energy loss metrics
- **Upload & Infer**: Upload drone images for AI-powered defect detection
- **User Management**: Create and manage maintenance staff accounts
- **System Configuration**: Manage system-wide settings

### Maintenance Staff Features
- **Dashboard**: Personal task overview and assigned panels
- **Task Management**: View and update assigned maintenance tasks
- **Inspection Reports**: Access detailed inspection reports
- **Profile Management**: Update personal profile and preferences

### Shared Features
- **Inspections**: List and detailed view of all inspections with AI summaries
- **Defects**: Comprehensive defect management with severity tracking
- **Analytics**: Charts and trends for panel health and maintenance
- **Dark/Light Mode**: Theme switching with persistence
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom design system
- **Routing**: React Router v6 with protected routes
- **HTTP Client**: Axios with interceptors
- **Charts**: Recharts for analytics visualizations
- **Maps**: Leaflet for panel location mapping
- **Icons**: Lucide React
- **State Management**: React Context API

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   └── apiClient.js          # Axios configuration and API methods
│   ├── components/
│   │   ├── Layout.jsx            # Main layout with sidebar and navigation
│   │   ├── ProtectedRoute.jsx    # Route protection with role-based access
│   │   └── Spinner.jsx           # Loading spinner component
│   ├── config/
│   │   └── api.js                # API endpoints configuration
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context provider
│   ├── pages/
│   │   ├── SignIn.jsx            # Login page
│   │   ├── Dashboard.jsx         # Admin dashboard
│   │   ├── MaintenanceDashboard.jsx # Maintenance staff dashboard
│   │   ├── Inspections.jsx       # Inspections list (TODO)
│   │   ├── InspectionDetail.jsx  # Single inspection view (TODO)
│   │   ├── Defects.jsx           # Defects management (TODO)
│   │   ├── DefectDetail.jsx      # Single defect view (TODO)
│   │   ├── Analytics.jsx         # Analytics and charts (TODO)
│   │   ├── UploadInfer.jsx       # Image upload and AI inference (TODO)
│   │   ├── Settings.jsx          # User and system settings (TODO)
│   │   ├── Unauthorized.jsx      # 403 error page
│   │   └── NotFound.jsx          # 404 error page
│   ├── index.css                 # Global styles and Tailwind imports
│   ├── main.jsx                  # Application entry point
│   └── App.jsx                   # Main application component
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python backend running on port 8000

### Installation

1. **Clone and navigate to frontend directory**:
   ```bash
   cd "D:\O-M Module\frontend"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

### Demo Credentials

**Admin User**:
- Email: `admin@insolare.ac.in`
- Password: `admin123`

**Maintenance Staff**:
- Email: `prithvi@insolare.ac.in`
- Password: `prithvi123`

## API Integration

The frontend is configured to connect to the Python FastAPI backend running on `http://localhost:8000`. The API client includes:

- **Existing Endpoints**: 
  - `/process-upload` - Image processing
  - `/download/{filename}` - File downloads
  - `/health` - Health check

- **TODO Endpoints** (need implementation in backend):
  - Authentication endpoints (`/auth/*`)
  - User management (`/users/*`)
  - Inspections (`/inspections/*`)
  - Defects (`/defects/*`)
  - Analytics (`/analytics/*`)
  - Settings (`/settings/*`)

## Development Status

### ✅ Completed
- [x] Project setup with Vite, React, and Tailwind
- [x] Authentication system with role-based access
- [x] Protected routing with role enforcement
- [x] Responsive layout with sidebar navigation
- [x] Admin and Maintenance dashboards
- [x] Dark/light mode toggle
- [x] API client with mock authentication

### 🚧 In Progress
- [ ] Inspections pages with data tables and filters
- [ ] Defects management with status updates
- [ ] Upload-Infer page with file upload and progress
- [ ] Analytics page with charts and trends
- [ ] Settings page with role-based views
- [ ] Additional components (MapView, Heatmap, Modal, etc.)

### 📋 TODO
- [ ] Real-time updates via WebSocket
- [ ] Offline support with PWA features
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Mobile app optimization
- [ ] Performance optimization
- [ ] Unit and integration tests

## Backend Integration Notes

The frontend includes comprehensive API endpoint definitions in `src/config/api.js`. Key integration points:

1. **Authentication**: Mock implementation - replace with real JWT auth
2. **File Upload**: Integrated with existing `/process-upload` endpoint
3. **Data Fetching**: Mock data provided - replace with real API calls
4. **WebSocket**: Prepared for real-time alerts and processing updates

## Configuration

### Environment Variables
Create a `.env` file for environment-specific settings:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### API Configuration
Update `src/config/api.js` to modify:
- Base URL for backend API
- Endpoint definitions
- Request timeout settings

## Build and Deployment

### Development Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Deployment
The build output in `dist/` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3 + CloudFront
- Nginx/Apache

## Contributing

1. Follow the established code structure
2. Use TypeScript interfaces for new API endpoints
3. Implement error handling for all API calls
4. Add loading states for async operations
5. Follow the existing Tailwind design patterns
6. Test with both admin and maintenance user roles

## License

This project is part of the O&M Module system. All rights reserved.
