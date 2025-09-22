import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

/**
 * ProtectedRoute component that enforces authentication and role-based access
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if access is granted
 * @param {string|Array<string>} props.requiredRole - Required role(s) to access the route
 * @param {boolean} props.adminOnly - If true, only admin users can access
 * @param {string} props.redirectTo - Where to redirect if access is denied (default: '/signin')
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  adminOnly = false,
  redirectTo = '/signin' 
}) => {
  const { isAuthenticated, isLoading, user, hasRole, isAdmin } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="large" />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    )
  }

  // Check admin-only access
  if (adminOnly && !isAdmin()) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          message: 'You do not have permission to access this page. Admin access required.',
          from: location 
        }} 
        replace 
      />
    )
  }

  // Check role-based access
  if (requiredRole) {
    let hasRequiredRole = false
    
    if (Array.isArray(requiredRole)) {
      // Multiple roles allowed
      hasRequiredRole = requiredRole.some(role => hasRole(role))
    } else {
      // Single role required
      hasRequiredRole = hasRole(requiredRole)
    }

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ 
            message: `You do not have permission to access this page. Required role: ${
              Array.isArray(requiredRole) ? requiredRole.join(' or ') : requiredRole
            }`,
            from: location 
          }} 
          replace 
        />
      )
    }
  }

  // Access granted - render the protected content
  return children
}

export default ProtectedRoute
