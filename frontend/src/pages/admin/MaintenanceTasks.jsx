import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Wrench, 
  Calendar, 
  MapPin, 
  User, 
  Eye,
  FileText,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'
import { Button, Badge, Skeleton, EmptyState } from '../../components/ui'

const MaintenanceTasks = () => {
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
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const response = await api.maintenance.list(params)
      setTasks(response.data.tasks || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error fetching maintenance tasks:', err)
      error('Failed to load maintenance tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!confirm(`Are you sure you want to delete the task "${taskTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await api.maintenance.delete(taskId)
      success('Maintenance task deleted successfully')
      fetchTasks()
    } catch (err) {
      console.error('Error deleting task:', err)
      error('Failed to delete maintenance task')
    }
  }



  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Maintenance Tasks
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage all maintenance tasks and observations
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
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
                <option value="cancelled">Cancelled</option>
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
        <div className="space-y-4">
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Wrench />}
          title="No maintenance tasks found"
          message={
            filters.search || filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first maintenance task to get started'
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task._id} className="card hover:shadow-lg transition-shadow">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <Badge priority={task.priority}>
                          {task.priority}
                        </Badge>
                        <Badge status={task.status}>
                          {task.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {task.taskId}
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        {task.assignedTo && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>
                              {task.assignedTo.firstName} {task.assignedTo.lastName}
                            </span>
                          </div>
                        )}
                        {task.location?.site && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{task.location.site}</span>
                          </div>
                        )}
                        {task.observations && task.observations.length > 0 && (
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="font-medium text-primary-600 dark:text-primary-400">
                              {task.observations.length} Observation{task.observations.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <Link to={`/admin/maintenance/${task._id}/observations`}>
                        <Button size="sm" leftIcon={<Eye />}>
                          View Observations
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="danger"
                        leftIcon={<Trash2 />}
                        onClick={() => handleDeleteTask(task._id, task.title)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<ChevronLeft />}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  rightIcon={<ChevronRight />}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default MaintenanceTasks
