import React, { useState } from 'react'
import { Plus, Search, Filter, Clock, CheckCircle, AlertTriangle, User } from 'lucide-react'

const MaintenanceRequests = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  // Mock maintenance requests data
  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'HVAC System Repair - Building A',
      description: 'Air conditioning unit not working properly in the main building',
      priority: 'high',
      status: 'pending',
      assignedTo: 'john.doe',
      requestedBy: 'admin',
      createdAt: '2024-01-20T09:00:00Z',
      dueDate: '2024-01-22T17:00:00Z',
      category: 'HVAC'
    },
    {
      id: 2,
      title: 'Plumbing Issue - Restroom B2',
      description: 'Leaking faucet in the second floor restroom',
      priority: 'medium',
      status: 'in_progress',
      assignedTo: 'jane.smith',
      requestedBy: 'admin',
      createdAt: '2024-01-19T14:30:00Z',
      dueDate: '2024-01-21T12:00:00Z',
      category: 'Plumbing'
    },
    {
      id: 3,
      title: 'Electrical Panel Inspection',
      description: 'Routine inspection of main electrical panel',
      priority: 'low',
      status: 'completed',
      assignedTo: 'mike.wilson',
      requestedBy: 'admin',
      createdAt: '2024-01-18T10:15:00Z',
      dueDate: '2024-01-20T16:00:00Z',
      category: 'Electrical',
      completedAt: '2024-01-19T15:30:00Z'
    },
    {
      id: 4,
      title: 'Security Camera Maintenance',
      description: 'Clean and calibrate security cameras in parking area',
      priority: 'medium',
      status: 'pending',
      assignedTo: null,
      requestedBy: 'admin',
      createdAt: '2024-01-20T11:00:00Z',
      dueDate: '2024-01-23T14:00:00Z',
      category: 'Security'
    }
  ])

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return styles[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const handleAssignRequest = (requestId, userId) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { ...request, assignedTo: userId, status: 'in_progress' }
        : request
    ))
  }

  const handleUpdateStatus = (requestId, newStatus) => {
    setRequests(requests.map(request => 
      request.id === requestId 
        ? { 
            ...request, 
            status: newStatus,
            ...(newStatus === 'completed' && { completedAt: new Date().toISOString() })
          }
        : request
    ))
  }

  const mockUsers = [
    { id: 'john.doe', name: 'John Doe' },
    { id: 'jane.smith', name: 'Jane Smith' },
    { id: 'mike.wilson', name: 'Mike Wilson' }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Maintenance Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and assign maintenance tasks
          </p>
        </div>
        <button className="btn-primary inline-flex items-center">
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {requests.filter(r => r.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <AlertTriangle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {requests.filter(r => r.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <User className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {requests.filter(r => !r.assignedTo).length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Unassigned</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Requests
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
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
                Priority
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
                Showing {filteredRequests.length} of {requests.length} requests
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="card">
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {request.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBadge(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {request.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <span className="font-medium">Category:</span> {request.category}
                    </div>
                    <div>
                      <span className="font-medium">Assigned to:</span>{' '}
                      {request.assignedTo ? mockUsers.find(u => u.id === request.assignedTo)?.name : 'Unassigned'}
                    </div>
                    <div>
                      <span className="font-medium">Due:</span> {new Date(request.dueDate).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span> {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {!request.assignedTo && (
                    <select
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1"
                      onChange={(e) => handleAssignRequest(request.id, e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>Assign to...</option>
                      {mockUsers.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  )}
                  
                  {request.status !== 'completed' && (
                    <select
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1"
                      value={request.status}
                      onChange={(e) => handleUpdateStatus(request.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm">
                    Edit
                  </button>
                  <button className="btn-primary text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No maintenance requests match your current filters.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceRequests
