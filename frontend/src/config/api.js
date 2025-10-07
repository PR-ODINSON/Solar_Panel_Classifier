// API Configuration for the O&M Module Frontend
// This file contains all API endpoints and configuration for connecting to the Python FastAPI backend

export const API_CONFIG = {
  // Base URL for the backend server - without /api prefix
  BASE_URL: 'http://localhost:8000',
  
  // Timeout for API requests (in milliseconds)
  TIMEOUT: 30000,
  
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
  }
}

// API Endpoints mapping
export const API_ENDPOINTS = {
  // Authentication endpoints (TODO: Need to be implemented in backend)
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me'
  },
  
  // User management endpoints (TODO: Need to be implemented in backend)
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    GET: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`
  },
  
  // Solar panel processing endpoints (existing in backend)
  PROCESSING: {
    UPLOAD: '/process-upload',
    DOWNLOAD: (filename) => `/download/${filename}`,
    HEALTH: '/health'
  },
  
  // Inspection endpoints (TODO: Need to be implemented in backend)
  INSPECTIONS: {
    LIST: '/inspections',
    CREATE: '/inspections',
    GET: (id) => `/inspections/${id}`,
    UPDATE: (id) => `/inspections/${id}`,
    DELETE: (id) => `/inspections/${id}`,
    DOWNLOAD_REPORT: (id) => `/inspections/${id}/report`
  },
  
  // Defects endpoints (TODO: Need to be implemented in backend)
  DEFECTS: {
    LIST: '/defects',
    CREATE: '/defects',
    GET: (id) => `/defects/${id}`,
    UPDATE: (id) => `/defects/${id}`,
    DELETE: (id) => `/defects/${id}`,
    BY_PANEL: (panelId) => `/panels/${panelId}/defects`,
    STATISTICS: '/defects/statistics'
  },
  
  // Analytics endpoints (TODO: Need to be implemented in backend)
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    PANEL_HEALTH: '/analytics/panel-health',
    ENERGY_LOSS: '/analytics/energy-loss',
    MAINTENANCE_TRENDS: '/analytics/maintenance-trends',
    PREDICTIVE: '/analytics/predictive'
  },
  
  // Panel endpoints (TODO: Need to be implemented in backend)
  PANELS: {
    LIST: '/panels',
    GET: (id) => `/panels/${id}`,
    UPDATE: (id) => `/panels/${id}`,
    LOCATION_MAP: '/panels/map'
  },
  
  // Settings endpoints (TODO: Need to be implemented in backend)
  SETTINGS: {
    SYSTEM: '/settings/system',
    UPDATE_SYSTEM: '/settings/system',
    USER_PROFILE: '/settings/profile',
    UPDATE_PROFILE: '/settings/profile'
  },
  
  // WebSocket endpoints (TODO: Need to be implemented in backend)
  WEBSOCKET: {
    ALERTS: '/ws/alerts',
    PROCESSING_STATUS: '/ws/processing'
  }
}

// Request/Response interfaces for type checking (comments for documentation)
/*
  TODO: Backend endpoints to implement:
  
  1. Authentication:
     POST /auth/login - { username, password } -> { token, user, role }
     POST /auth/logout - {} -> { success }
     POST /auth/refresh - { refresh_token } -> { token }
     GET /auth/me - {} -> { user, role }
  
  2. Users (Admin only):
     GET /users - {} -> { users: [...] }
     POST /users - { username, email, role, password } -> { user }
     GET /users/:id - {} -> { user }
     PUT /users/:id - { updates } -> { user }
     DELETE /users/:id - {} -> { success }
  
  3. Inspections:
     GET /inspections - { page?, limit?, status?, date_from?, date_to? } -> { inspections, total }
     POST /inspections - { title, description, panel_ids, scheduled_date } -> { inspection }
     GET /inspections/:id - {} -> { inspection, defects, ai_summary }
     PUT /inspections/:id - { updates } -> { inspection }
     DELETE /inspections/:id - {} -> { success }
     GET /inspections/:id/report - {} -> file download
  
  4. Defects:
     GET /defects - { page?, limit?, severity?, status?, panel_id? } -> { defects, total }
     POST /defects - { panel_id, type, severity, description, image? } -> { defect }
     GET /defects/:id - {} -> { defect }
     PUT /defects/:id - { status?, notes?, assigned_to? } -> { defect }
     DELETE /defects/:id - {} -> { success }
     GET /panels/:id/defects - {} -> { defects }
     GET /defects/statistics - {} -> { by_type, by_severity, trends }
  
  5. Analytics:
     GET /analytics/dashboard - { role } -> { total_panels, defective_count, energy_loss, alerts }
     GET /analytics/panel-health - { date_range? } -> { health_trends, efficiency_data }
     GET /analytics/energy-loss - { panel_id?, date_range? } -> { energy_loss_data }
     GET /analytics/maintenance-trends - {} -> { maintenance_schedule, cost_trends }
     GET /analytics/predictive - {} -> { predictions, recommendations }
  
  6. Panels:
     GET /panels - { status?, location? } -> { panels }
     GET /panels/:id - {} -> { panel, recent_inspections, defects }
     PUT /panels/:id - { status?, notes? } -> { panel }
     GET /panels/map - {} -> { panels_with_coordinates }
  
  7. Settings:
     GET /settings/system - {} -> { settings }
     PUT /settings/system - { settings } -> { settings }
     GET /settings/profile - {} -> { profile }
     PUT /settings/profile - { profile_updates } -> { profile }
  
  8. WebSocket:
     /ws/alerts - Real-time alerts for critical defects
     /ws/processing - Real-time updates for image processing jobs
*/
