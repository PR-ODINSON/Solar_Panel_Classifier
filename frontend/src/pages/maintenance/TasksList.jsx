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
import { Button, Badge, Input, Select, Skeleton, EmptyState, Card } from '../../components/ui'

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
        assignedTo: user?.id || user?._id, // Filter tasks assigned to current user
        ...filters
      }
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      // Fetch assigned maintenance tasks
      const response = await api.maintenance.list(params)
      setTasks(response.data.tasks || [])
      setTotalPages(response.data.pagination?.pages || 1)
    } catch (err) {
      console.error('Error fetching maintenance tasks:', err)
      error('Failed to load your tasks')
    } finally {
      setLoading(false)
    }
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
      <Card className="mb-6">
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              leftIcon={<Search className="h-5 w-5" />}
            />
            <Select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              options={[
                { value: 'pending', label: 'Pending' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'on_hold', label: 'On Hold' }
              ]}
              placeholder="All Status"
            />
            <Select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
                { value: 'critical', label: 'Critical' }
              ]}
              placeholder="All Priority"
            />
          </div>
        </Card.Body>
      </Card>

      {/* Tasks List */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </div>
      ) : tasks.length === 0 ? (
        <Card>
          <Card.Body>
            <EmptyState
              icon={<Wrench className="h-16 w-16" />}
              title="No maintenance tasks found"
              message={
                filters.search || filters.status || filters.priority
                  ? 'Try adjusting your filters'
                  : 'You have no assigned tasks at the moment'
              }
            />
          </Card.Body>
        </Card>
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
                        {task.taskId} | Type: {task.type?.replace('_', ' ')} | Category: {task.category}
                      </p>

                      <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                        {task.description}
                      </p>

                      <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {task.location?.site && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>{task.location.site}</span>
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
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
                        <Badge variant="danger">
                          <AlertTriangle className="h-3 w-3 mr-1 inline" />
                          Overdue
                        </Badge>
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
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
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

export default MaintenanceTasksList
