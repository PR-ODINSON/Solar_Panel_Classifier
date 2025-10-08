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
  const [upcomingSchedule, setUpcomingSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch defects (backend automatically filters for assigned defects for non-admin users)
      const defectsRes = await api.defects.list({ 
        limit: 100 
      })
      
      const defects = defectsRes.data?.defects || []
      
      // Debug logging
      console.log('Current user:', {
        id: user?._id,
        username: user?.username,
        email: user?.email,
        role: user?.role,
        firstName: user?.firstName,
        lastName: user?.lastName
      })
      console.log('Fetched defects:', defects.length, defects.map(d => ({
        id: d._id,
        defectId: d.defectId,
        assignedTo: d.assignedTo,
        status: d.status
      })))
      
      // Calculate stats from real data
      const pendingTasks = defects.filter(d => d.status === 'open' || d.status === 'in_progress').length
      const criticalAlerts = defects.filter(d => d.severity === 'critical').length
      const completedToday = defects.filter(d => {
        const today = new Date().toDateString()
        return d.status === 'resolved' && new Date(d.updatedAt).toDateString() === today
      }).length
      
      // Get unique panel count from defects
      const uniquePanels = new Set(defects.map(d => d.panelId).filter(Boolean))
      
      setDashboardData({
        panelsAssigned: uniquePanels.size,
        pendingTasks,
        criticalAlerts,
        completedToday
      })
      
      // Set tasks from defects
      setMyTasks(defects.slice(0, 5).map(defect => ({
        id: defect._id,
        title: `${defect.defectType?.replace('_', ' ') || 'Unknown'} - ${defect.defectId}`,
        priority: defect.priority || defect.severity || 'medium',
        status: defect.status || 'open',
        dueDate: defect.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        location: defect.location?.description || defect.location?.site || 'Location not specified',
        estimatedTime: '1-2 hours',
        defectType: defect.defectType,
        description: defect.description || 'No description available',
        severity: defect.severity || 'medium'
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
      // Get recent defects (backend automatically filters for assigned defects)
      const defectsRes = await api.defects.list({ 
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })
      
      const activities = []
      
      if (defectsRes.data?.defects) {
        defectsRes.data.defects.forEach(defect => {
          let action = 'Assigned'
          if (defect.status === 'resolved') action = 'Completed'
          else if (defect.status === 'in_progress') action = 'Started'
          
          activities.push({
            id: defect._id,
            action,
            task: `${defect.defectType} repair - ${defect.defectId}`,
            time: getTimeAgo(defect.updatedAt),
            timestamp: new Date(defect.updatedAt)
          })
        })
      }
      
      setRecentActivity(activities.slice(0, 5))
      
    } catch (err) {
      console.error('Error fetching recent activities:', err)
    }
  }

  // Fetch upcoming schedule (for now, use pending tasks as schedule)
  const fetchUpcomingSchedule = async () => {
    try {
      const defectsRes = await api.defects.list({ 
        status: 'open',
        limit: 5,
        sortBy: 'dueDate',
        sortOrder: 'asc'
      })
      
      const schedule = []
      
      if (defectsRes.data?.defects) {
        defectsRes.data.defects.forEach(defect => {
          schedule.push({
            id: defect._id,
            title: `${defect.defectType} Repair - ${defect.defectId}`,
            time: defect.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            type: 'maintenance'
          })
        })
      }
      
      setUpcomingSchedule(schedule)
      
    } catch (err) {
      console.error('Error fetching upcoming schedule:', err)
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
      fetchUpcomingSchedule()
      
      // Set up auto-refresh every 2 minutes (more frequent for better UX)
      const interval = setInterval(() => {
        fetchDashboardData()
        fetchRecentActivities()
        fetchUpcomingSchedule()
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
        fetchUpcomingSchedule()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user?._id])

  // Manual refresh
  const handleRefresh = async () => {
    info('Refreshing dashboard data...')
    await Promise.all([fetchDashboardData(), fetchRecentActivities(), fetchUpcomingSchedule()])
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
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-green-600 bg-green-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in_progress':
        return 'text-blue-600 bg-blue-100'
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
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
                  to={`/maintenance/defects/${task.id}`}
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
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due {new Date(task.dueDate).toLocaleDateString()}
                    </div>
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

      {/* Upcoming schedule and quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming schedule */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Upcoming Schedule
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {upcomingSchedule.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No upcoming tasks</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Your scheduled maintenance tasks will appear here
                  </p>
                </div>
              ) : (
                upcomingSchedule.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <div className={`p-2 rounded-full mr-3 ${
                      item.type === 'maintenance' ? 'bg-blue-100 text-blue-600' :
                      item.type === 'training' ? 'bg-green-100 text-green-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {item.type === 'maintenance' && <Wrench className="h-4 w-4" />}
                      {item.type === 'training' && <TrendingUp className="h-4 w-4" />}
                      {item.type === 'inspection' && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(item.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )))}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/maintenance/defects"
                className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200 group"
              >
                <Wrench className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Manage Defects
                </p>
              </Link>
              
              <Link
                to="/maintenance/inspections"
                className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200 group"
              >
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  View Reports
                </p>
              </Link>
              
              <button className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200 group">
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Log Time
                </p>
              </button>
              
              <Link
                to="/maintenance/settings"
                className="p-4 text-center border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200 group"
              >
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Profile Settings
                </p>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Performance summary - Real data from completed tasks */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Your Performance Summary
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : dashboardData.completedToday}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tasks completed today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                {loading ? '...' : dashboardData.pendingTasks}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Pending tasks
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-semibold ${
                dashboardData.criticalAlerts === 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {loading ? '...' : (dashboardData.criticalAlerts === 0 ? 'All Clear' : `${dashboardData.criticalAlerts} Critical`)}
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

export default MaintenanceDashboard
