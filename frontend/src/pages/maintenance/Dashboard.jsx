import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Wrench,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const { toasts, removeToast, success, error, info } = useToast()
  const [dashboardData, setDashboardData] = useState({
    panelsAssigned: 0,
    pendingTasks: 0,
    criticalAlerts: 0,
    completedToday: 0
  })
  const [myTasks, setMyTasks] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch assigned defects (which are tasks for maintenance staff)
      const tasksRes = await api.defects.list({ 
        assignedTo: user?.id || user?._id,
        limit: 100
      })
      
      const tasks = tasksRes.data?.defects || []
      
      // Debug logging
      console.log('Current user:', {
        id: user?._id,
        username: user?.username,
        email: user?.email,
        role: user?.role,
        firstName: user?.firstName,
        lastName: user?.lastName
      })
      console.log('Fetched maintenance tasks:', tasks.length, tasks.map(t => ({
        id: t._id,
        taskId: t.taskId,
        title: t.title,
        assignedTo: t.assignedTo,
        status: t.status,
        scheduledDate: t.scheduledDate,
        createdAt: t.createdAt
      })))
      
      // Calculate stats from real data
      const pendingTasks = tasks.filter(t => 
        t.status === 'pending' || t.status === 'assigned' || t.status === 'in_progress'
      ).length
      
      const criticalAlerts = tasks.filter(t => t.priority === 'critical').length
      
      const completedToday = tasks.filter(t => {
        const today = new Date().toDateString()
        return t.status === 'completed' && new Date(t.completedAt || t.updatedAt).toDateString() === today
      }).length
      
      // Get unique panel count from tasks
      const uniquePanels = new Set()
      tasks.forEach(task => {
        if (task.panel) uniquePanels.add(task.panel)
        if (task.panels) task.panels.forEach(p => uniquePanels.add(p))
      })
      
      setDashboardData({
        panelsAssigned: uniquePanels.size,
        pendingTasks,
        criticalAlerts,
        completedToday
      })
      
      // Set tasks from assigned defects
      setMyTasks(tasks.slice(0, 5).map(defect => ({
        id: defect._id,
        title: `${defect.defectType.replace('_', ' ')} Defect - ${defect.defectId}`,
        priority: defect.priority,
        status: defect.status,
        scheduledDate: defect.detectedDate,
        location: defect.location?.description || defect.location?.site || 'Location not specified',
        estimatedTime: '1-2 hours',
        taskId: defect.defectId,
        description: defect.description || 'No description available',
        type: defect.defectType,
        category: defect.severity,
        createdAt: defect.detectedDate
      })))
      
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
      // Get recent assigned defects (which are tasks for maintenance staff)
      const tasksRes = await api.defects.list({ 
        assignedTo: user?.id || user?._id,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })
      
      const activities = []
      
      if (tasksRes.data?.defects) {
        tasksRes.data.defects.forEach(task => {
          let action = 'Assigned'
          if (task.status === 'resolved' || task.status === 'closed') action = 'Completed'
          else if (task.status === 'in_progress') action = 'Started'
          else if (task.status === 'open') action = 'Assigned'
          
          activities.push({
            id: task._id,
            action,
            task: `${task.defectType.replace('_', ' ')} - ${task.defectId}`,
            time: getTimeAgo(task.updatedAt),
            timestamp: new Date(task.updatedAt)
          })
        })
      }
      
      setRecentActivity(activities.slice(0, 5))
      
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

  // Load data on component mount and when user changes
  useEffect(() => {
    if (user?._id) {
      fetchDashboardData()
      fetchRecentActivities()
      
      // Set up auto-refresh every 2 minutes (more frequent for better UX)
      const interval = setInterval(() => {
        fetchDashboardData()
        fetchRecentActivities()
      }, 2 * 60 * 1000)
      
      return () => clearInterval(interval)
    }
  }, [user?._id, user?.username]) // Also depend on username to catch user updates

  // Refresh data when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?._id) {
        fetchDashboardData()
        fetchRecentActivities()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?._id])

  // Manual refresh
  const handleRefresh = async () => {
    info('Refreshing dashboard data...')
    await Promise.all([fetchDashboardData(), fetchRecentActivities()])
    success('Dashboard data refreshed successfully')
  }

  const stats = [
    {
      name: 'Panels Assigned',
      value: loading ? '...' : dashboardData.panelsAssigned,
      icon: TrendingUp,
      color: 'blue',
      description: 'Panels under your maintenance'
    },
    {
      name: 'Pending Tasks',
      value: loading ? '...' : dashboardData.pendingTasks,
      icon: Clock,
      color: 'yellow',
      description: 'Repair tasks awaiting action'
    },
    {
      name: 'Critical Alerts',
      value: loading ? '...' : dashboardData.criticalAlerts,
      icon: AlertTriangle,
      color: 'red',
      description: 'High priority defects'
    },
    {
      name: 'Completed Today',
      value: loading ? '...' : dashboardData.completedToday,
      icon: CheckCircle,
      color: 'green',
      description: 'Tasks finished today'
    }
  ]

  const getPriorityColor = (priority) => {
    if (!priority) return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    switch (priority.toLowerCase()) {
      case 'critical':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900'
      case 'high':
        return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900'
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'low':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    }
  }

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900'
      case 'in_progress':
        return 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900'
      case 'assigned':
        return 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900'
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900'
      case 'on_hold':
        return 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
      case 'cancelled':
        return 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900'
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's your solar panel maintenance overview for today
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  stat.color === 'red' ? 'bg-red-100 dark:bg-red-900' :
                  'bg-blue-100 dark:bg-blue-900'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'red' ? 'text-red-600 dark:text-red-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My assigned tasks */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                My Assigned Tasks
              </h3>
              <Link
                to="/maintenance/defects"
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No assigned tasks yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Tasks will appear here when defects are assigned to you
                  </p>
                </div>
              ) : (
                myTasks.slice(0, 3).map((task) => (
                <Link
                  key={task.id}
                  to={`/maintenance/tasks/${task.id}`}
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-4">
                    {task.scheduledDate && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Scheduled {new Date(task.scheduledDate).toLocaleDateString()}
                      </div>
                    )}
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {task.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {task.estimatedTime}
                    </div>
                  </div>
                </Link>
              )))}
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Your recent task updates will appear here
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full mt-1 ${
                    activity.action === 'Completed' ? 'bg-green-100 text-green-600' :
                    activity.action === 'Started' ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.action === 'Completed' && <CheckCircle className="h-4 w-4" />}
                    {activity.action === 'Started' && <Clock className="h-4 w-4" />}
                    {activity.action === 'Assigned' && <Wrench className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium">{activity.action}</span> {activity.task}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default MaintenanceDashboard
