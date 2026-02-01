import React, { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { 
  Menu, 
  X, 
  BarChart3, 
  Camera, 
  AlertTriangle, 
  Search, 
  Settings, 
  LogOut, 
  User,
  Zap,
  Bell,
  Sun,
  Moon,
  Home,
  Upload,
  FileText,
  ChevronDown,
  Lock,
  Users,
  Wrench
} from 'lucide-react'

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true'
  )
  const { user, logout, isAdmin, isMaintenanceStaff } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    await logout()
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    if (isAdmin()) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
        { name: 'Upload & Infer', href: '/upload-infer', icon: Upload },
        { name: 'Inspection Reports', href: '/inspections', icon: FileText },
        { name: 'Defect Management', href: '/defects', icon: AlertTriangle },
        { name: 'Maintenance Tasks', href: '/admin/maintenance', icon: Wrench },
        { name: 'Staff Management', href: '/staff', icon: Users }
      ]
    }

    if (isMaintenanceStaff()) {
      return [
        { name: 'Dashboard', href: '/maintenance/dashboard', icon: Home },
        { name: 'My Tasks', href: '/maintenance/tasks', icon: Wrench },
        { name: 'Defect Management', href: '/maintenance/defects', icon: AlertTriangle },
        { name: 'Settings', href: '/maintenance/settings', icon: Settings }
      ]
    }

    return []
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center mr-3">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              O&M Module
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || user?.username}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  sidebar-item
                  ${isActive ? 'active' : ''}
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Sign out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 dark:text-white lg:ml-0">
                {/* Dynamic page title based on current route */}
                {(() => {
                  const routeTitle = {
                    '/dashboard': 'O&M Dashboard',
                    '/upload-infer': 'Upload & Infer Images',
                    '/inspections': 'Inspection Reports',
                    '/defects': 'Defect Management',
                    '/staff': 'Staff Management',
                    '/admin/maintenance': 'Maintenance Tasks',
                    '/maintenance/dashboard': 'Maintenance Dashboard',
                    '/maintenance/tasks': 'My Tasks',
                    '/maintenance/defects': 'Defect Management',
                    '/maintenance/settings': 'Profile Settings'
                  }
                  // Handle dynamic routes like /inspections/:id
                  if (location.pathname.startsWith('/inspections/')) {
                    return 'Inspection Details'
                  }
                  if (location.pathname.startsWith('/defects/')) {
                    return 'Defect Details'
                  }
                  if (location.pathname.startsWith('/maintenance/tasks/')) {
                    return 'Task Details'
                  }
                  if (location.pathname.match(/\/admin\/maintenance\/[^/]+\/observations/)) {
                    return 'Task Observations'
                  }
                  return routeTitle[location.pathname] || 'Dashboard'
                })()}
              </h1>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>

              {/* User menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                    {user?.username}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400 hidden sm:block" />
                </button>

                {/* Dropdown menu */}
                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name || user?.username}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {user?.role?.replace('_', ' ')}
                        </p>
                      </div>
                      
                      {isMaintenanceStaff() && (
                        <button
                          onClick={() => {
                            navigate('/maintenance/settings')
                            setUserMenuOpen(false)
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Settings className="h-4 w-4 mr-3" />
                          Profile Settings
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          handleLogout()
                          setUserMenuOpen(false)
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-t border-gray-200 dark:border-gray-700"
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8 lg:pr-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
