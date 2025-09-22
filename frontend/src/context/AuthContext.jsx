import React, { createContext, useContext, useReducer, useEffect } from 'react'
import api, { getToken, removeToken } from '../api/apiClient.js'

// Auth context
const AuthContext = createContext()

// Auth state initial values
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
}

// Auth reducer for managing authentication state
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      }
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      }
    
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on app load
  useEffect(() => {
    const initAuth = async () => {
      // Clear any existing invalid tokens first
      removeToken()
      
      // Always start with unauthenticated state
      dispatch({
        type: 'AUTH_FAILURE',
        payload: null
      })
    }

    initAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' })
      
      const response = await api.auth.login(credentials)
      const { token, user } = response.data
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: errorMessage
      })
      return { success: false, error: errorMessage }
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await api.auth.logout()
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error('Logout error:', error)
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' })
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!state.user) return false
    
    // Admin has access to everything
    if (state.user.role === 'admin') return true
    
    // Check specific role
    return state.user.role === requiredRole
  }

  // Check if user is admin
  const isAdmin = () => hasRole('admin')

  // Check if user is maintenance staff
  const isMaintenanceStaff = () => hasRole('maintenance_staff')

  const value = {
    // State
    ...state,
    
    // Actions
    login,
    logout,
    clearError,
    
    // Role checking utilities
    hasRole,
    isAdmin,
    isMaintenanceStaff
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  
  return context
}

export default AuthContext
