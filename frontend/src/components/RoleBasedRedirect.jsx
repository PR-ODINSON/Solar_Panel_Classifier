import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

/**
 * RoleBasedRedirect component that handles initial routing based on user role
 * Redirects users to appropriate dashboard or login page
 */
const RoleBasedRedirect = () => {
  const { isAuthenticated, isLoading, user, isAdmin, isMaintenanceStaff } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spinner size="large" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }

  // Redirect based on user role
  if (isAdmin()) {
    return <Navigate to="/admin/dashboard" replace />
  } else if (isMaintenanceStaff()) {
    return <Navigate to="/maintenance/dashboard" replace />
  } else {
    // Fallback for unknown roles - redirect to signin
    return <Navigate to="/signin" replace />
  }
}

export default RoleBasedRedirect
