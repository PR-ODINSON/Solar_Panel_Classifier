import axios from 'axios'
import { API_CONFIG } from '../config/api.js'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// Token management
const getToken = () => localStorage.getItem('token')
const setToken = (token) => localStorage.setItem('token', token)
const removeToken = () => localStorage.removeItem('token')

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      removeToken()
      // Redirect to login page
      window.location.href = '/signin'
    }
    return Promise.reject(error)
  }
)

// API methods for different operations
const api = {
  // Generic HTTP methods
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),

  // Authentication methods
  auth: {
    login: async (credentials) => {
      // TODO: Update endpoint when backend auth is implemented
      // For now, mock the authentication
      try {
        // This will be replaced with actual backend call:
        // const response = await apiClient.post('/auth/login', credentials)
        
        // Mock authentication for development
        const mockResponse = {
          data: {
            token: 'mock-jwt-token-' + Date.now(),
            user: {
              id: 1,
              username: credentials.username,
              email: credentials.username + '@example.com',
              role: credentials.username === 'admin' ? 'admin' : 'maintenance_staff',
              name: credentials.username === 'admin' ? 'System Administrator' : 'Maintenance Staff'
            }
          }
        }
        
        if (credentials.username && credentials.password) {
          setToken(mockResponse.data.token)
          return mockResponse
        } else {
          throw new Error('Invalid credentials')
        }
      } catch (error) {
        throw new Error('Authentication failed: ' + error.message)
      }
    },
    
    logout: async () => {
      try {
        // TODO: Call backend logout endpoint when implemented
        // await apiClient.post('/auth/logout')
        removeToken()
        return { success: true }
      } catch (error) {
        // Even if backend call fails, remove local token
        removeToken()
        throw error
      }
    },
    
    getCurrentUser: async () => {
      try {
        // TODO: Replace with actual backend call when implemented
        // const response = await apiClient.get('/auth/me')
        
        // Mock current user for development
        const token = getToken()
        if (!token) {
          throw new Error('No token found')
        }
        
        // Parse mock user from token (in real app, backend would validate token)
        const mockUser = {
          id: 1,
          username: token.includes('admin') ? 'admin' : 'maintenance',
          email: 'user@example.com',
          role: token.includes('admin') ? 'admin' : 'maintenance_staff',
          name: token.includes('admin') ? 'System Administrator' : 'Maintenance Staff'
        }
        
        return { data: mockUser }
      } catch (error) {
        removeToken()
        throw error
      }
    }
  },

  // File upload methods (existing backend endpoint)
  upload: {
    processImages: async (files, onProgress = null) => {
      const formData = new FormData()
      files.forEach((file) => {
        formData.append('files', file)
      })

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      if (onProgress) {
        config.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(percentCompleted)
        }
      }

      return apiClient.post('/process-upload', formData, config)
    },

    downloadFile: (filename) => {
      return apiClient.get(`/download/${filename}`, {
        responseType: 'blob'
      })
    }
  },

  // Health check (existing backend endpoint)
  health: {
    check: () => apiClient.get('/health')
  },

  // Mock API methods for development (TODO: Replace with real backend calls)
  inspections: {
    list: async (params = {}) => {
      // Mock data for development
      const mockInspections = [
        {
          id: 1,
          title: 'Monthly Inspection - Block A',
          status: 'completed',
          date: '2024-01-15',
          panels_count: 150,
          defects_found: 12,
          inspector: 'John Doe',
          ai_confidence: 0.94
        },
        {
          id: 2,
          title: 'Routine Check - Block B',
          status: 'in_progress',
          date: '2024-01-20',
          panels_count: 200,
          defects_found: 8,
          inspector: 'Jane Smith',
          ai_confidence: 0.89
        }
      ]
      
      return { data: { inspections: mockInspections, total: mockInspections.length } }
    },

    get: async (id) => {
      const mockInspection = {
        id: parseInt(id),
        title: 'Monthly Inspection - Block A',
        description: 'Comprehensive inspection of solar panels in Block A',
        status: 'completed',
        date: '2024-01-15',
        panels_count: 150,
        defects_found: 12,
        inspector: 'John Doe',
        ai_summary: 'AI detected 12 defects across 150 panels. Most common issues: dust accumulation (6), bird droppings (4), minor physical damage (2).',
        defects: [
          { id: 1, panel_id: 'PA001', type: 'Dusty', severity: 'Medium' },
          { id: 2, panel_id: 'PA002', type: 'Bird-drop', severity: 'Low' }
        ]
      }
      
      return { data: mockInspection }
    }
  },

  defects: {
    list: async (params = {}) => {
      const mockDefects = [
        {
          id: 1,
          panel_id: 'PA001',
          type: 'Dusty',
          severity: 'Medium',
          status: 'Open',
          description: 'Heavy dust accumulation affecting efficiency',
          created_date: '2024-01-15',
          assigned_to: 'John Doe'
        },
        {
          id: 2,
          panel_id: 'PA002',
          type: 'Bird-drop',
          severity: 'Low',
          status: 'In Progress',
          description: 'Bird droppings on panel surface',
          created_date: '2024-01-16',
          assigned_to: 'Jane Smith'
        }
      ]
      
      return { data: { defects: mockDefects, total: mockDefects.length } }
    },

    get: async (id) => {
      const mockDefect = {
        id: parseInt(id),
        panel_id: 'PA001',
        type: 'Dusty',
        severity: 'Medium',
        status: 'Open',
        description: 'Heavy dust accumulation affecting panel efficiency by approximately 15%',
        created_date: '2024-01-15',
        assigned_to: 'John Doe',
        location: { lat: 40.7128, lng: -74.0060 },
        images: ['/outputs/PA001_defect.jpg'],
        maintenance_notes: ''
      }
      
      return { data: mockDefect }
    },

    update: async (id, updates) => {
      // Mock update response
      return { data: { id: parseInt(id), ...updates, updated_at: new Date().toISOString() } }
    },

    statistics: async () => {
      const mockStats = {
        by_type: {
          'Dusty': 45,
          'Bird-drop': 23,
          'Physical-Damage': 12,
          'Clean': 420
        },
        by_severity: {
          'Low': 35,
          'Medium': 30,
          'High': 15,
          'Critical': 5
        },
        trends: {
          weekly: [12, 15, 8, 20, 18, 14, 16],
          monthly: [45, 52, 38, 60, 55, 48, 51]
        }
      }
      
      return { data: mockStats }
    }
  },

  analytics: {
    dashboard: async (role) => {
      const mockDashboard = {
        total_panels: 500,
        active_panels: 485,
        defective_count: 15,
        energy_loss: 12.5,
        alerts: [
          { id: 1, type: 'critical', message: '3 panels with critical defects', time: '2024-01-20T10:30:00Z' },
          { id: 2, type: 'warning', message: 'Scheduled maintenance due for Block C', time: '2024-01-20T09:15:00Z' }
        ],
        recent_inspections: 8,
        pending_tasks: role === 'admin' ? 12 : 5
      }
      
      return { data: mockDashboard }
    },

    panelHealth: async () => {
      const mockHealthData = {
        efficiency_trends: [
          { date: '2024-01-01', efficiency: 95.2 },
          { date: '2024-01-02', efficiency: 94.8 },
          { date: '2024-01-03', efficiency: 94.5 },
          { date: '2024-01-04', efficiency: 93.9 },
          { date: '2024-01-05', efficiency: 94.1 }
        ],
        health_distribution: {
          excellent: 420,
          good: 65,
          fair: 12,
          poor: 3
        }
      }
      
      return { data: mockHealthData }
    }
  },

  panels: {
    list: async () => {
      const mockPanels = Array.from({ length: 20 }, (_, i) => ({
        id: `PA${String(i + 1).padStart(3, '0')}`,
        status: Math.random() > 0.1 ? 'active' : 'defective',
        efficiency: Math.round((Math.random() * 10 + 90) * 100) / 100,
        location: {
          lat: 40.7128 + (Math.random() - 0.5) * 0.01,
          lng: -74.0060 + (Math.random() - 0.5) * 0.01
        },
        installation_date: '2023-06-15',
        last_inspection: '2024-01-15'
      }))
      
      return { data: mockPanels }
    }
  }
}

// Export token management functions for use in auth context
export { getToken, setToken, removeToken }

export default api
