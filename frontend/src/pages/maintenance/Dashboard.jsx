import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Wrench,
  TrendingUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const MaintenanceDashboard = () => {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    panelsAssigned: 240,
    pendingTasks: 8,
    criticalAlerts: 3,
    completedToday: 5
  })

  // Mock data for assigned tasks
  const myTasks = [
    {
      id: 1,
      title: 'Repair Cracked Panel A-15',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-01-22T17:00:00Z',
      location: 'Section A, Row 3, Column 15',
      estimatedTime: '2 hours',
      defectType: 'crack'
    },
    {
      id: 2,
      title: 'Fix Hot Spot in Panel A-23',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-21T12:00:00Z',
      location: 'Section A, Row 5, Column 23',
      estimatedTime: '1 hour',
      defectType: 'hotspot'
    },
    {
      id: 3,
      title: 'Clean Dust from Panel Array B',
      priority: 'low',
      status: 'pending',
      dueDate: '2024-01-24T16:00:00Z',
      location: 'Section B, Rows 8-12',
      estimatedTime: '45 minutes',
      defectType: 'dust'
    }
  ]

  const recentActivity = [
    { id: 1, action: 'Completed', task: 'Panel dust cleaning in Section C', time: '2 hours ago' },
    { id: 2, action: 'Started', task: 'Crack repair for Panel A-15', time: '4 hours ago' },
    { id: 3, action: 'Assigned', task: 'Hot spot investigation in Section B', time: '1 day ago' }
  ]

  const upcomingSchedule = [
    { id: 1, title: 'Panel Cleaning - Section D', time: '2024-01-22T09:00:00Z', type: 'maintenance' },
    { id: 2, title: 'Defect Assessment Training', time: '2024-01-23T14:00:00Z', type: 'training' },
    { id: 3, title: 'Quarterly Inspection Round', time: '2024-01-24T08:00:00Z', type: 'inspection' }
  ]

  const stats = [
    {
      name: 'Panels Assigned',
      value: dashboardData.panelsAssigned,
      icon: TrendingUp,
      color: 'blue',
      description: 'Panels under your maintenance'
    },
    {
      name: 'Pending Tasks',
      value: dashboardData.pendingTasks,
      icon: Clock,
      color: 'yellow',
      description: 'Repair tasks awaiting action'
    },
    {
      name: 'Critical Alerts',
      value: dashboardData.criticalAlerts,
      icon: AlertTriangle,
      color: 'red',
      description: 'High priority defects'
    },
    {
      name: 'Completed Today',
      value: dashboardData.completedToday,
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
              Welcome back, {user?.name || user?.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Here's your solar panel maintenance overview for today
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
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
              {myTasks.slice(0, 3).map((task) => (
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
              ))}
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
              {recentActivity.map((activity) => (
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
              ))}
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
              {upcomingSchedule.map((item) => (
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
              ))}
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

      {/* Performance summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Your Performance This Week
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                12
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tasks completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                95%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                On-time completion
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
                32h
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Hours logged
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
                4.8/5
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Average rating
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceDashboard
