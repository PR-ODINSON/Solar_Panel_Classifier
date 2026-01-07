import axios from 'axios'
import { API_CONFIG } from '../config/api.js'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.HEADERS
})

// Token management
const getToken = () => localStorage.getItem('accessToken')
const setToken = (token) => localStorage.setItem('accessToken', token)
const removeToken = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
}

const getRefreshToken = () => localStorage.getItem('refreshToken')
const setRefreshToken = (token) => localStorage.setItem('refreshToken', token)

// Check if user is authenticated (has valid token)
const isAuthenticated = () => {
  const token = getToken()
  const user = localStorage.getItem('user')
  return !!(token && user)
}

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

// Response interceptor to handle auth errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh the token
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/refresh`, {
            refreshToken
          })
          
          const { accessToken } = response.data.data
          setToken(accessToken)
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
      }

      // If refresh fails or no refresh token, logout
      removeToken()
      window.location.href = '/signin'
      return Promise.reject(error)
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
      try {
        const response = await apiClient.post('/api/auth/login', {
          email: credentials.email,
          password: credentials.password
        })
        
        const { user, accessToken, refreshToken } = response.data.data
        
        // Store tokens and user data
        setToken(accessToken)
        setRefreshToken(refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        return {
          data: {
            token: accessToken,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
              name: user.fullName || `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName
            }
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        const message = error.response?.data?.message || 'Authentication failed'
        throw new Error(message)
      }
    },
    
    logout: async () => {
      try {
        const refreshToken = getRefreshToken()
        if (refreshToken) {
          await apiClient.post('/api/auth/logout', { refreshToken })
        }
        removeToken()
        return { success: true }
      } catch (error) {
        // Even if backend call fails, remove local token
        removeToken()
        console.error('Logout error:', error)
        return { success: true }
      }
    },
    
    register: async (userData) => {
      try {
        const response = await apiClient.post('/api/auth/register', userData)
        
        const { user, accessToken, refreshToken } = response.data.data
        
        // Store tokens and user data
        setToken(accessToken)
        setRefreshToken(refreshToken)
        localStorage.setItem('user', JSON.stringify(user))
        
        return {
          data: {
            token: accessToken,
            user: {
              id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
              name: user.fullName || `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName
            }
          }
        }
      } catch (error) {
        console.error('Registration error:', error)
        const message = error.response?.data?.message || 'Registration failed'
        const errors = error.response?.data?.errors || []
        throw new Error(JSON.stringify({ message, errors }))
      }
    },

    getCurrentUser: async () => {
      try {
        // Check if we have a valid token first
        const token = getToken()
        if (!token) {
          throw new Error('No authentication token found')
        }

        // First try to get user from localStorage
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser)
            // Validate that the stored user has required fields
            if (user._id && user.username && user.email && user.role) {
              return {
                data: {
                  id: user._id,
                  username: user.username,
                  email: user.email,
                  role: user.role,
                  name: user.fullName || `${user.firstName} ${user.lastName}`,
                  firstName: user.firstName,
                  lastName: user.lastName
                }
              }
            }
          } catch (parseError) {
            console.warn('Invalid stored user data, fetching from server')
            localStorage.removeItem('user')
          }
        }
        
        // If no valid stored user, fetch from backend
        const response = await apiClient.get('/api/auth/me')
        const { user } = response.data.data
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(user))
        
        return {
          data: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            name: user.fullName || `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName
          }
        }
      } catch (error) {
        console.error('Get current user error:', error)
        removeToken()
        throw error
      }
    },

    changePassword: async (passwordData) => {
      try {
        const response = await apiClient.put('/api/auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
        return response.data
      } catch (error) {
        console.error('Change password error:', error)
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

  // Real API methods for inspections (connected to MongoDB backend)
  inspections: {
    list: async (params = {}) => {
      try {
        const response = await apiClient.get('/api/inspections', { params })
        return response.data
      } catch (error) {
        console.error('Error fetching inspections:', error)
        return { data: { inspections: [], total: 0 } }
      }
    },

    get: async (id) => {
      try {
        const response = await apiClient.get(`/api/inspections/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching inspection:', error)
        throw error
      }
    },

    create: async (inspectionData) => {
      try {
        const response = await apiClient.post('/api/inspections', inspectionData)
        return response.data
      } catch (error) {
        console.error('Error creating inspection:', error)
        throw error
      }
    },

    update: async (id, updates) => {
      try {
        const response = await apiClient.put(`/api/inspections/${id}`, updates)
        return response.data
      } catch (error) {
        console.error('Error updating inspection:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/api/inspections/${id}`)
        return response.data
      } catch (error) {
        console.error('Error deleting inspection:', error)
        throw error
      }
    },

    getStats: async () => {
      try {
        const response = await apiClient.get('/api/inspections/stats')
        return response.data
      } catch (error) {
        console.error('Error fetching inspection stats:', error)
        throw error
      }
    },

    getOverdue: async () => {
      try {
        const response = await apiClient.get('/api/inspections/status/overdue')
        return response.data
      } catch (error) {
        console.error('Error fetching overdue inspections:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/api/inspections/${id}`)
        return response.data
      } catch (error) {
        console.error('Error deleting inspection:', error)
        throw error
      }
    },

    getCritical: async () => {
      try {
        const response = await apiClient.get('/api/inspections/priority/critical')
        return response.data
      } catch (error) {
        console.error('Error fetching critical inspections:', error)
        throw error
      }
    }
  },

  defects: {
    list: async (params = {}) => {
      try {
        const response = await apiClient.get('/api/defects', { params })
        return response.data
      } catch (error) {
        console.error('Error fetching defects:', error)
        return { data: { defects: [], total: 0 } }
      }
    },

    get: async (id) => {
      try {
        const response = await apiClient.get(`/api/defects/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching defect:', error)
        throw error
      }
    },

    create: async (defectData) => {
      try {
        const response = await apiClient.post('/api/defects', defectData)
        return response.data
      } catch (error) {
        console.error('Error creating defect:', error)
        throw error
      }
    },

    update: async (id, updates) => {
      try {
        const response = await apiClient.put(`/api/defects/${id}`, updates)
        return response.data
      } catch (error) {
        console.error('Error updating defect:', error)
        throw error
      }
    },

    addNote: async (id, noteText) => {
      try {
        const response = await apiClient.post(`/api/defects/${id}/notes`, { text: noteText })
        return response.data
      } catch (error) {
        console.error('Error adding defect note:', error)
        throw error
      }
    },

    getStats: async () => {
      try {
        const response = await apiClient.get('/api/defects/stats')
        return response.data
      } catch (error) {
        console.error('Error fetching defect stats:', error)
        throw error
      }
    },

    getCritical: async () => {
      try {
        const response = await apiClient.get('/api/defects/priority/critical')
        return response.data
      } catch (error) {
        console.error('Error fetching critical defects:', error)
        throw error
      }
    },

    // Observations for defects (defects are tasks for maintenance staff)
    getObservations: async (defectId) => {
      try {
        const response = await apiClient.get(`/api/defects/${defectId}/observations`)
        return response.data
      } catch (error) {
        console.error('Error fetching observations:', error)
        throw error
      }
    },

    addObservation: async (defectId, observationData) => {
      try {
        const response = await apiClient.post(`/api/defects/${defectId}/observations`, observationData)
        return response.data
      } catch (error) {
        console.error('Error adding observation:', error)
        throw error
      }
    },

    deleteObservation: async (defectId, observationId) => {
      try {
        const response = await apiClient.delete(`/api/defects/${defectId}/observations/${observationId}`)
        return response.data
      } catch (error) {
        console.error('Error deleting observation:', error)
        throw error
      }
    },

    getOverdue: async () => {
      try {
        const response = await apiClient.get('/api/defects/status/overdue')
        return response.data
      } catch (error) {
        console.error('Error fetching overdue defects:', error)
        throw error
      }
    }
  },

  analytics: {
    dashboard: async (role) => {
      try {
        // Get real data from inspections
        const inspectionsResponse = await api.inspections.list()
        const inspections = inspectionsResponse.data.inspections || []
        
        const dashboard = {
          total_panels: 0, // Will be calculated from inspection reports
          active_panels: 0,
          defective_count: 0,
          energy_loss: 0,
          alerts: [],
          recent_inspections: inspections.length,
          pending_tasks: role === 'admin' ? 0 : 0 // No pending tasks without database
        }
        
        return { data: dashboard }
      } catch (error) {
        console.error('Error fetching dashboard analytics:', error)
        // Return minimal data on error
        return { 
          data: {
            total_panels: 0,
            active_panels: 0,
            defective_count: 0,
            energy_loss: 0,
            alerts: [],
            recent_inspections: 0,
            pending_tasks: 0
          }
        }
      }
    },

    panelHealth: async () => {
      try {
        // TODO: Extract health data from Excel reports
        // For now, return empty health data
        const healthData = {
          efficiency_trends: [],
          health_distribution: {
            excellent: 0,
            good: 0,
            fair: 0,
            poor: 0
          }
        }
        
        return { data: healthData }
      } catch (error) {
        console.error('Error fetching panel health analytics:', error)
        throw error
      }
    }
  },

  // Maintenance task management
  maintenance: {
    list: async (params = {}) => {
      try {
        const response = await apiClient.get('/api/maintenance', { params })
        return response.data
      } catch (error) {
        console.error('Error fetching maintenance tasks:', error)
        return { data: { tasks: [], total: 0 } }
      }
    },

    get: async (id) => {
      try {
        const response = await apiClient.get(`/api/maintenance/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching maintenance task:', error)
        throw error
      }
    },

    create: async (taskData) => {
      try {
        const response = await apiClient.post('/api/maintenance', taskData)
        return response.data
      } catch (error) {
        console.error('Error creating maintenance task:', error)
        throw error
      }
    },

    update: async (id, updates) => {
      try {
        const response = await apiClient.put(`/api/maintenance/${id}`, updates)
        return response.data
      } catch (error) {
        console.error('Error updating maintenance task:', error)
        throw error
      }
    },

    updateStatus: async (id, status) => {
      try {
        const response = await apiClient.put(`/api/maintenance/${id}/status`, { status })
        return response.data
      } catch (error) {
        console.error('Error updating task status:', error)
        throw error
      }
    },

    addNote: async (id, noteText, type = 'general') => {
      try {
        const response = await apiClient.post(`/api/maintenance/${id}/notes`, { text: noteText, type })
        return response.data
      } catch (error) {
        console.error('Error adding maintenance task note:', error)
        throw error
      }
    },

    getStats: async () => {
      try {
        const response = await apiClient.get('/api/maintenance/stats')
        return response.data
      } catch (error) {
        console.error('Error fetching maintenance stats:', error)
        throw error
      }
    },

    getOverdue: async () => {
      try {
        const response = await apiClient.get('/api/maintenance/status/overdue')
        return response.data
      } catch (error) {
        console.error('Error fetching overdue tasks:', error)
        throw error
      }
    },

    getHighPriority: async () => {
      try {
        const response = await apiClient.get('/api/maintenance/priority/high')
        return response.data
      } catch (error) {
        console.error('Error fetching high priority tasks:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/api/maintenance/${id}`)
        return response.data
      } catch (error) {
        console.error('Error deleting maintenance task:', error)
        throw error
      }
    },

    // Observation methods
    getObservations: async (taskId) => {
      try {
        const response = await apiClient.get(`/api/maintenance/${taskId}/observations`)
        return response.data
      } catch (error) {
        console.error('Error fetching observations:', error)
        throw error
      }
    },

    addObservation: async (taskId, observationData) => {
      try {
        const response = await apiClient.post(`/api/maintenance/${taskId}/observations`, observationData)
        return response.data
      } catch (error) {
        console.error('Error adding observation:', error)
        throw error
      }
    },

    updateObservation: async (taskId, observationId, updates) => {
      try {
        const response = await apiClient.put(`/api/maintenance/${taskId}/observations/${observationId}`, updates)
        return response.data
      } catch (error) {
        console.error('Error updating observation:', error)
        throw error
      }
    },

    deleteObservation: async (taskId, observationId) => {
      try {
        const response = await apiClient.delete(`/api/maintenance/${taskId}/observations/${observationId}`)
        return response.data
      } catch (error) {
        console.error('Error deleting observation:', error)
        throw error
      }
    },

    uploadObservationImages: async (files) => {
      try {
        const formData = new FormData()
        files.forEach(file => {
          formData.append('images', file)
        })
        
        const response = await apiClient.post('/api/maintenance/observations/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        return response.data
      } catch (error) {
        console.error('Error uploading observation images:', error)
        throw error
      }
    }
  },

  // User management (Admin only)
  users: {
    list: async (params = {}) => {
      try {
        const response = await apiClient.get('/api/users', { params })
        return response.data
      } catch (error) {
        console.error('Error fetching users:', error)
        return { success: false, data: { users: [], total: 0 } }
      }
    },

    get: async (id) => {
      try {
        const response = await apiClient.get(`/api/users/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching user:', error)
        throw error
      }
    },

    create: async (userData) => {
      try {
        const response = await apiClient.post('/api/users', userData)
        return response.data
      } catch (error) {
        console.error('Error creating user:', error)
        throw error
      }
    },

    update: async (id, updates) => {
      try {
        const response = await apiClient.put(`/api/users/${id}`, updates)
        return response.data
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      }
    },

    updateStatus: async (id, isActive) => {
      try {
        const response = await apiClient.put(`/api/users/${id}/status`, { isActive })
        return response.data
      } catch (error) {
        console.error('Error updating user status:', error)
        throw error
      }
    },

    resetPassword: async (id, newPassword) => {
      try {
        const response = await apiClient.put(`/api/users/${id}/password`, { newPassword })
        return response.data
      } catch (error) {
        console.error('Error resetting password:', error)
        throw error
      }
    },

    delete: async (id) => {
      try {
        const response = await apiClient.delete(`/api/users/${id}`)
        return response.data
      } catch (error) {
        console.error('Error deleting user:', error)
        throw error
      }
    },

    getStats: async () => {
      try {
        const response = await apiClient.get('/api/users/stats')
        return response.data
      } catch (error) {
        console.error('Error fetching user stats:', error)
        throw error
      }
    },

    getMaintenanceStaff: async () => {
      try {
        const response = await apiClient.get('/api/users/role/maintenance-staff')
        return response.data
      } catch (error) {
        console.error('Error fetching maintenance staff:', error)
        throw error
      }
    }
  },

  panels: {
    list: async (params = {}) => {
      try {
        const response = await apiClient.get('/api/panels', { params })
        return response.data
      } catch (error) {
        console.error('Error fetching panels:', error)
        return { data: { panels: [], total: 0 } }
      }
    },

    get: async (id) => {
      try {
        const response = await apiClient.get(`/api/panels/${id}`)
        return response.data
      } catch (error) {
        console.error('Error fetching panel:', error)
        throw error
      }
    },

    create: async (panelData) => {
      try {
        const response = await apiClient.post('/api/panels', panelData)
        return response.data
      } catch (error) {
        console.error('Error creating panel:', error)
        throw error
      }
    },

    update: async (id, updates) => {
      try {
        const response = await apiClient.put(`/api/panels/${id}`, updates)
        return response.data
      } catch (error) {
        console.error('Error updating panel:', error)
        throw error
      }
    },

    getStats: async () => {
      try {
        const response = await apiClient.get('/api/panels/stats')
        return response.data
      } catch (error) {
        console.error('Error fetching panel stats:', error)
        throw error
      }
    },

    getBySite: async (site) => {
      try {
        const response = await apiClient.get(`/api/panels/site/${site}`)
        return response.data
      } catch (error) {
        console.error('Error fetching panels by site:', error)
        throw error
      }
    },

    getNeedingInspection: async () => {
      try {
        const response = await apiClient.get('/api/panels/status/needing-inspection')
        return response.data
      } catch (error) {
        console.error('Error fetching panels needing inspection:', error)
        throw error
      }
    }
  }
}

// Export token management functions for use in auth context
export { getToken, setToken, removeToken, getRefreshToken, setRefreshToken, isAuthenticated }

export default api
