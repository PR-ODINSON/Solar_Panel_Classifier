import React, { useState, useEffect } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { Eye, EyeOff, Sun, Moon, Zap } from 'lucide-react'

const SignIn = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  
  const { login, isAuthenticated, isLoading, error, clearError, user } = useAuth()
  const location = useLocation()
  
  // Redirect path after successful login
  const from = location.state?.from?.pathname || '/'

  // Handle dark mode toggle
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true'
    setIsDarkMode(isDark)
    if (isDark) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    
    const result = await login(credentials)
    
    if (result.success) {
      // Redirect will happen automatically via Navigate component
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Demo credentials helper
  const fillDemoCredentials = (role) => {
    if (role === 'admin') {
      setCredentials({ email: 'admin@insolare.ac.in', password: 'admin123' })
    } else {
      setCredentials({ email: 'maintenance@solarpanel.com', password: 'maintenance123' })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-200"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      <div className="max-w-md w-full space-y-8 p-8">
        {/* Logo and header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center bg-primary-600 rounded-full mb-4">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            O&M Module
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Solar Panel Management System
          </p>
        </div>

        {/* Sign in form */}
        <div className="card">
          <div className="card-body">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error message */}
              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input-field"
                  placeholder="Enter your email address"
                  value={credentials.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="input-field pr-10"
                    placeholder="Enter your password"
                    value={credentials.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Remember me
                  </label>
                </div>
              </div>

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                Demo Credentials:
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('admin')}
                  className="flex-1 btn-secondary text-xs"
                >
                  Admin User
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials('maintenance')}
                  className="flex-1 btn-secondary text-xs"
                >
                  Maintenance Staff
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © 2024 O&M Module. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
