import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  Wrench, 
  FileText, 
  Settings as SettingsIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  UserCheck,
  RefreshCw
} from 'lucide-react'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'

const AdminDashboard = () => {
  const { toasts, removeToast, success, error, info } = useToast()
  const [dashboardData, setDashboardData] = useState({
    totalPanels: 0,
    totalDefects: 0,
    openDefects: 0,
    criticalDefects: 0,
    totalInspections: 0,
    completedInspections: 0,
    pendingInspections: 0,
    totalUsers: 0
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all required data in parallel
      const [panelsRes, defectsRes, defectStatsRes, inspectionsRes, usersRes] = await Promise.all([
        api.panels.list({ limit: 1 }), // Just get count
        api.defects.list({ limit: 1 }), // Just get count
        api.defects.getStats(),
        api.inspections.list({ limit: 1 }), // Just get count
        api.users.list({ limit: 1 }) // Just get count
      ])
      
      // Update dashboard data
      setDashboardData({
        totalPanels: panelsRes.data?.pagination?.total || 0,
        totalDefects: defectsRes.data?.pagination?.total || 0,
        openDefects: defectStatsRes.data?.open || 0,
        criticalDefects: defectStatsRes.data?.critical || 0,
        totalInspections: inspectionsRes.data?.pagination?.total || 0,
        completedInspections: inspectionsRes.data?.pagination?.total || 0,
        pendingInspections: 0, // Calculate based on status if needed
        totalUsers: usersRes.data?.pagination?.total || 0
      })
      
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      // Get recent inspections and defects
      const [inspectionsRes, defectsRes] = await Promise.all([
        api.inspections.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' }),
        api.defects.list({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
      ])
      
      const activities = []
      
      // Add inspection activities
      if (inspectionsRes.data?.inspections) {
        inspectionsRes.data.inspections.forEach(inspection => {
          activities.push({
            id: `inspection-${inspection._id}`,
            type: 'inspection',
            message: `AI inspection completed for ${inspection.location?.site || 'unknown site'} - ${inspection.inspectionId}`,
            time: getTimeAgo(inspection.createdAt),
            timestamp: new Date(inspection.createdAt)
          })
        })
      }
      
      // Add defect activities
      if (defectsRes.data?.defects) {
        defectsRes.data.defects.forEach(defect => {
          const message = defect.assignedTo 
            ? `Defect ${defect.defectId} assigned to ${defect.assignedTo.firstName} ${defect.assignedTo.lastName}`
            : `New ${defect.defectType} defect detected - ${defect.defectId}`
          
          activities.push({
            id: `defect-${defect._id}`,
            type: defect.assignedTo ? 'assignment' : 'defect',
            message,
            time: getTimeAgo(defect.createdAt),
            timestamp: new Date(defect.createdAt)
          })
        })
      }
      
      // Sort by timestamp and take latest 8
      activities.sort((a, b) => b.timestamp - a.timestamp)
      setRecentActivities(activities.slice(0, 8))
      
    } catch (err) {
      console.error('Error fetching recent activities:', err)
    }
  }
  
  // Helper function to format time ago
  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }
  
  // Load data on component mount
  useEffect(() => {
    fetchDashboardData()
    fetchRecentActivities()
    
    // Set up auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData()
      fetchRecentActivities()
    }, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Manual refresh
  const handleRefresh = async () => {
    info('Refreshing dashboard data...')
    await Promise.all([fetchDashboardData(), fetchRecentActivities()])
    success('Dashboard data refreshed successfully')
  }

  const quickActions = [
    {
      name: 'Upload & Infer',
      description: 'Upload drone images for AI analysis',
      href: '/upload-infer',
      icon: Camera,
      color: 'blue',
      count: null
    },
    {
      name: 'Inspection Reports',
      description: 'View and manage inspection reports',
      href: '/inspections',
      icon: FileText,
      color: 'green',
      count: dashboardData.totalInspections
    },
    {
      name: 'Defect Management',
      description: 'Manage detected defects and repairs',
      href: '/defects',
      icon: AlertTriangle,
      color: 'yellow',
      count: dashboardData.totalDefects
    },
    {
      name: 'User Management',
      description: 'Manage system users and permissions',
      href: '/users',
      icon: Users,
      color: 'purple',
      count: dashboardData.totalUsers
    }
  ]

  const stats = [
    {
      name: 'Total Panels Monitored',
      value: loading ? '...' : dashboardData.totalPanels,
      change: `${dashboardData.totalPanels} panels in system`,
      changeType: 'neutral',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      name: 'Total Defects',
      value: loading ? '...' : dashboardData.totalDefects,
      change: `${dashboardData.openDefects} open defects`,
      changeType: dashboardData.openDefects > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
      color: 'red'
    },
    {
      name: 'Completed Inspections',
      value: loading ? '...' : dashboardData.totalInspections,
      change: `${dashboardData.totalInspections} total inspections`,
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green'
    },
    {
      name: 'Critical Defects',
      value: loading ? '...' : dashboardData.criticalDefects,
      change: `${dashboardData.criticalDefects} need immediate attention`,
      changeType: dashboardData.criticalDefects > 0 ? 'negative' : 'positive',
      icon: AlertTriangle,
      color: 'yellow'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              O&M Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Solar panel monitoring and maintenance overview
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary inline-flex items-center"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {lastUpdated.toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className={`h-4 w-4 mr-1 ${
                      stat.changeType === 'positive' ? 'text-green-500' : 
                      stat.changeType === 'negative' ? 'text-red-500' : 'text-gray-500'
                    }`} />
                    <span className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 
                      stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  'bg-red-100 dark:bg-red-900'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions and recent activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.href}
                  className="p-3 lg:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        action.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                        action.color === 'green' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      } group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600">
                          {action.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    {action.count && (
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        {action.count}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Recent activities */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activities
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full mt-1 ${
                    activity.type === 'inspection' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                    activity.type === 'defect' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' :
                    activity.type === 'assignment' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                    activity.type === 'alert' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' :
                    'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {activity.type === 'inspection' && <Camera className="h-4 w-4" />}
                    {activity.type === 'defect' && <AlertTriangle className="h-4 w-4" />}
                    {activity.type === 'assignment' && <UserCheck className="h-4 w-4" />}
                    {activity.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                    {activity.type === 'report' && <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            System Overview
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : dashboardData.openDefects}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Open defects
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : dashboardData.totalUsers}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                System users
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-semibold ${
                dashboardData.criticalDefects === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {loading ? '...' : (dashboardData.criticalDefects === 0 ? 'All Clear' : `${dashboardData.criticalDefects} Critical`)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                System status
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default AdminDashboard
