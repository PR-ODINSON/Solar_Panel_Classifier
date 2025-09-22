import React, { useState } from 'react'
import { 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Edit,
  Play,
  Square
} from 'lucide-react'

const MyTasks = () => {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  // Mock tasks data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'HVAC System Repair - Building A',
      description: 'Air conditioning unit not working properly in the main building. Need to check filters and refrigerant levels.',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-01-22T17:00:00Z',
      location: 'Building A, Floor 3',
      estimatedTime: '3 hours',
      assignedDate: '2024-01-20T09:00:00Z',
      category: 'HVAC',
      progress: 60
    },
    {
      id: 2,
      title: 'Plumbing Issue - Restroom B2',
      description: 'Leaking faucet in the second floor restroom needs immediate attention.',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-01-21T12:00:00Z',
      location: 'Building B, Floor 2',
      estimatedTime: '1.5 hours',
      assignedDate: '2024-01-19T14:30:00Z',
      category: 'Plumbing',
      progress: 0
    },
    {
      id: 3,
      title: 'Light Fixture Replacement',
      description: 'Replace burnt out LED fixtures in the main lobby area.',
      priority: 'low',
      status: 'pending',
      dueDate: '2024-01-24T16:00:00Z',
      location: 'Building C, Lobby',
      estimatedTime: '45 minutes',
      assignedDate: '2024-01-20T11:00:00Z',
      category: 'Electrical',
      progress: 0
    },
    {
      id: 4,
      title: 'Security Camera Maintenance',
      description: 'Clean and calibrate security cameras in parking area.',
      priority: 'medium',
      status: 'completed',
      dueDate: '2024-01-20T16:00:00Z',
      location: 'Parking Area',
      estimatedTime: '2 hours',
      assignedDate: '2024-01-18T10:15:00Z',
      category: 'Security',
      progress: 100,
      completedDate: '2024-01-19T15:30:00Z'
    }
  ])

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
    return matchesStatus && matchesPriority
  })

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

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            ...(newStatus === 'completed' && { 
              completedDate: new Date().toISOString(),
              progress: 100 
            }),
            ...(newStatus === 'in_progress' && { 
              progress: task.progress || 25 
            })
          }
        : task
    ))
  }

  const taskCounts = {
    all: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and update your assigned maintenance tasks
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {taskCounts.all}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <Clock className="h-8 w-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {taskCounts.pending}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <AlertTriangle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {taskCounts.in_progress}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {taskCounts.completed}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                className="input-field"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Priority
              </label>
              <select
                className="input-field"
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredTasks.length} of {tasks.length} tasks
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {task.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium">Due:</span>
                      <span className="ml-1">{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="font-medium">Location:</span>
                      <span className="ml-1">{task.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-medium">Estimated:</span>
                      <span className="ml-1">{task.estimatedTime}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium">Category:</span>
                      <span className="ml-1">{task.category}</span>
                    </div>
                  </div>

                  {/* Progress bar for in-progress tasks */}
                  {task.status === 'in_progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progress
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {task.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Assigned: {new Date(task.assignedDate).toLocaleDateString()}
                  {task.completedDate && (
                    <span className="ml-4">
                      Completed: {new Date(task.completedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                      className="btn-primary text-sm inline-flex items-center"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Task
                    </button>
                  )}
                  
                  {task.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        className="btn-success text-sm inline-flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'pending')}
                        className="btn-secondary text-sm inline-flex items-center"
                      >
                        <Square className="h-4 w-4 mr-1" />
                        Pause
                      </button>
                    </>
                  )}
                  
                  <button className="btn-secondary text-sm inline-flex items-center">
                    <Edit className="h-4 w-4 mr-1" />
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No tasks match your current filters.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTasks
