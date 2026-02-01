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
import { Button, Badge, Card, Skeleton, EmptyState } from '../../components/ui'

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
      
      // Fetch assigned maintenance tasks
      const tasksRes = await api.maintenance.list({ 
        assignedTo: user?.id || user?._id,
        limit: 100
      })
      
      const tasks = tasksRes.data?.tasks || []
      
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
      
      // Set tasks from assigned maintenance tasks
      setMyTasks(tasks.slice(0, 5).map(task => ({
        id: task._id,
        title: task.title,
        priority: task.priority,
        status: task.status,
        scheduledDate: task.scheduledDate,
        location: task.location?.site || 'Location not specified',
        estimatedTime: task.estimatedDuration ? `${Math.round(task.estimatedDuration / 60)} hour${task.estimatedDuration > 60 ? 's' : ''}` : '1-2 hours',
        taskId: task.taskId,
        description: task.description || 'No description available',
        type: task.type,
        category: task.category,
        createdAt: task.createdAt,
        relatedDefect: task.relatedDefect // Include defect info
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
      // Get recent assigned maintenance tasks
      const tasksRes = await api.maintenance.list({ 
        assignedTo: user?.id || user?._id,
        limit: 10,
        sortBy: 'updatedAt',
        sortOrder: 'desc'
      })
      
      const activities = []
      
      if (tasksRes.data?.tasks) {
        tasksRes.data.tasks.forEach(task => {
          let action = 'Assigned'
          if (task.status === 'completed') action = 'Completed'
          else if (task.status === 'in_progress') action = 'Started'
          else if (task.status === 'assigned') action = 'Assigned'
          
          activities.push({
            id: task._id,
            action,
            task: `${task.title} - ${task.taskId}`,
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

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <Card>
        <Card.Body>
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
              <Button
                variant="secondary"
                size="md"
                onClick={handleRefresh}
                disabled={loading}
                leftIcon={<RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />}
              >
                Refresh
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
            <Skeleton.Card />
          </>
        ) : (
          stats.map((stat) => (
            <Card key={stat.name}>
              <Card.Body>
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
              </Card.Body>
            </Card>
          ))
        )}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My assigned tasks */}
        <Card>
          <Card.Header>
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
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {myTasks.length === 0 ? (
                <EmptyState
                  icon={<Wrench className="h-12 w-12" />}
                  title="No assigned tasks yet"
                  message="Tasks will appear here when defects are assigned to you"
                />
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
                      <Badge priority={task.priority}>
                        {task.priority}
                      </Badge>
                      <Badge status={task.status}>
                        {task.status.replace('_', ' ')}
                      </Badge>
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
          </Card.Body>
        </Card>

        {/* Recent activity */}
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <EmptyState
                  icon={<Clock className="h-12 w-12" />}
                  title="No recent activity"
                  message="Your recent task updates will appear here"
                />
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
          </Card.Body>
        </Card>
      </div>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default MaintenanceDashboard
