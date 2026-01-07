import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wrench, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'

const MaintenanceTasksList = () => {
  const { user } = useAuth()
  const { toasts, removeToast, success, error } = useToast()
  
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: ''
  })

  useEffect(() => {
    fetchTasks()
  }, [currentPage, filters])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 10,
        assignedTo: user?.id || user?._id, // Filter defects assigned to current user
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      // Fetch assigned defects (which are tasks for maintenance staff)
      const response = await api.defects.list(params)
      setTasks(response.data.defects || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error fetching assigned defects:', err)
      error('Failed to load your tasks')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[status] || colors.pending
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          My Maintenance Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your assigned maintenance tasks
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="input pl-10 w-full"
                />
              </div>
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="input w-full"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="input w-full"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No maintenance tasks found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {filters.search || filters.status || filters.priority
                  ? 'Try adjusting your filters'
                  : 'You have no assigned tasks at the moment'
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {tasks.map((task) => (
              <Link
                key={task._id}
                to={`/maintenance/tasks/${task._id}`}
                className="card hover:shadow-lg transition-shadow block"
              >
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {task.defectType?.replace('_', ' ')} Defect - {task.defectId}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                          {task.status?.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.defectId} | Severity: {task.severity}
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {task.location?.description && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{task.location.description}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Detected: {new Date(task.detectedDate).toLocaleDateString()}</span>
                        </div>
                        {task.observations && task.observations.length > 0 && (
                          <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <span className="font-medium text-primary-600 dark:text-primary-400">
                              {task.observations.length} Observation{task.observations.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {task.isOverdue && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary btn-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary btn-sm"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default MaintenanceTasksList
