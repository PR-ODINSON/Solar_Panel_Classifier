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
  Clock
} from 'lucide-react'

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 24,
    activeUsers: 18,
    pendingRequests: 12,
    completedToday: 8,
    totalReports: 156,
    criticalIssues: 3
  })

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, type: 'user', message: 'New user John Smith registered', time: '2 minutes ago' },
    { id: 2, type: 'request', message: 'Maintenance request #1234 completed', time: '15 minutes ago' },
    { id: 3, type: 'alert', message: 'Critical issue reported in Block A', time: '1 hour ago' },
    { id: 4, type: 'report', message: 'Weekly report generated', time: '2 hours ago' }
  ]

  const quickActions = [
    {
      name: 'Manage Users',
      description: 'Add, edit, or deactivate user accounts',
      href: '/admin/users',
      icon: Users,
      color: 'blue',
      count: dashboardData.totalUsers
    },
    {
      name: 'Maintenance Requests',
      description: 'View and assign maintenance tasks',
      href: '/admin/maintenance-requests',
      icon: Wrench,
      color: 'yellow',
      count: dashboardData.pendingRequests
    },
    {
      name: 'Reports',
      description: 'Generate and view system reports',
      href: '/admin/reports',
      icon: FileText,
      color: 'green',
      count: dashboardData.totalReports
    },
    {
      name: 'System Settings',
      description: 'Configure system parameters',
      href: '/admin/settings',
      icon: SettingsIcon,
      color: 'purple',
      count: null
    }
  ]

  const stats = [
    {
      name: 'Total Users',
      value: dashboardData.totalUsers,
      change: '+2 this week',
      changeType: 'positive',
      icon: Users,
      color: 'blue'
    },
    {
      name: 'Active Users',
      value: dashboardData.activeUsers,
      change: '+5 since yesterday',
      changeType: 'positive',
      icon: CheckCircle,
      color: 'green'
    },
    {
      name: 'Pending Requests',
      value: dashboardData.pendingRequests,
      change: '-3 from yesterday',
      changeType: 'positive',
      icon: Clock,
      color: 'yellow'
    },
    {
      name: 'Critical Issues',
      value: dashboardData.criticalIssues,
      change: '+1 new',
      changeType: 'negative',
      icon: AlertTriangle,
      color: 'red'
    }
  ]

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              System overview and management tools
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Last updated</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleString()}
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
                      stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <span className={`text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
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
                    activity.type === 'user' ? 'bg-blue-100 text-blue-600' :
                    activity.type === 'request' ? 'bg-green-100 text-green-600' :
                    activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {activity.type === 'user' && <Users className="h-4 w-4" />}
                    {activity.type === 'request' && <Wrench className="h-4 w-4" />}
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
                {dashboardData.completedToday}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tasks completed today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                98.5%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                System uptime
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {Math.round((dashboardData.activeUsers / dashboardData.totalUsers) * 100)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                User activity rate
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
