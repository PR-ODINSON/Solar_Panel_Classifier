import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  X,
  Upload,
  Save,
  Trash2,
  User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, removeToast, success, error, info } = useToast()
  
  const [task, setTask] = useState(null)
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddObservation, setShowAddObservation] = useState(false)
  const [observationText, setObservationText] = useState('')
  const [observationImages, setObservationImages] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchTaskDetails()
    fetchObservations()
  }, [id])

  const fetchTaskDetails = async () => {
    try {
      setLoading(true)
      // Fetch defect details (defects are treated as tasks for maintenance staff)
      const response = await api.defects.get(id)
      console.log('Task response:', response) // Debug log
      
      // Handle different response structures
      const taskData = response.data?.defect || response.defect || response.data?.data?.defect
      
      if (!taskData) {
        console.error('Task not found in response:', response)
        error('Task not found')
        return
      }
      
      setTask(taskData)
    } catch (err) {
      console.error('Error fetching task details:', err)
      error('Failed to load task details')
    } finally {
      setLoading(false)
    }
  }

  const fetchObservations = async () => {
    try {
      // Use defects API for observations (defects are tasks for maintenance staff)
      const response = await api.defects.getObservations(id)
      setObservations(response.data?.observations || [])
    } catch (err) {
      console.error('Error fetching observations:', err)
    }
  }

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    setObservationImages(prev => [...prev, ...files])
  }

  const handleRemoveImage = (index) => {
    setObservationImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmitObservation = async () => {
    if (!observationText.trim() && observationImages.length === 0) {
      error('Please add text or images to the observation')
      return
    }

    try {
      setSubmitting(true)

      const observationData = {
        text: observationText.trim(),
        images: observationImages // Pass File objects directly
      }

      // Use defects API for observations (defects are tasks)
      const response = await api.defects.addObservation(id, observationData)
      
      if (response.success) {
        success('Observation added successfully')
        setObservationText('')
        setObservationImages([])
        setShowAddObservation(false)
        fetchObservations()
      }
    } catch (err) {
      console.error('Error submitting observation:', err)
      error('Failed to submit observation')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteObservation = async (observationId) => {
    if (!confirm('Are you sure you want to delete this observation?')) return

    try {
      // Use defects API for observations (defects are tasks)
      await api.defects.deleteObservation(id, observationId)
      success('Observation deleted successfully')
      fetchObservations()
    } catch (err) {
      console.error('Error deleting observation:', err)
      error('Failed to delete observation')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Task Not Found</h2>
          <button
            onClick={() => navigate('/maintenance/dashboard')}
            className="mt-4 btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{task.taskId}</p>
          </div>
          <div className="flex space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.status?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Details</h3>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{task.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                    <p className="mt-1 text-gray-900 dark:text-white capitalize">{task.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <p className="mt-1 text-gray-900 dark:text-white capitalize">{task.category}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {task.location?.site}
                  </div>
                  {task.estimatedDuration && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      {task.estimatedDuration} min
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Observations Section */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Extra Observations</h3>
                <button
                  onClick={() => setShowAddObservation(!showAddObservation)}
                  className="btn-primary btn-sm"
                >
                  {showAddObservation ? 'Cancel' : 'Add Observation'}
                </button>
              </div>
            </div>
            <div className="card-body">
              {/* Add Observation Form */}
              {showAddObservation && (
                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">New Observation</h4>
                  
                  {/* Text Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Details
                    </label>
                    <textarea
                      value={observationText}
                      onChange={(e) => setObservationText(e.target.value)}
                      placeholder="Add any additional observations about this task or nearby panels..."
                      rows={4}
                      className="input w-full"
                    />
                  </div>

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Images (Optional)
                    </label>
                    <div className="flex items-center space-x-2 mb-3">
                      <label className="btn-secondary btn-sm cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Choose Images
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                          max="5"
                        />
                      </label>
                      <span className="text-xs text-gray-500">Max 5 images, 5MB each</span>
                    </div>

                    {/* Preview selected images */}
                    {observationImages.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {observationImages.map((file, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="absolute bottom-1 left-1 px-2 py-1 bg-black/50 text-white text-xs rounded">
                              {(file.size / 1024 / 1024).toFixed(2)}MB
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setShowAddObservation(false)
                        setObservationText('')
                        setObservationImages([])
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitObservation}
                      disabled={submitting || (!observationText.trim() && observationImages.length === 0)}
                      className="btn-primary"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {submitting ? 'Saving...' : 'Save Observation'}
                    </button>
                  </div>
                </div>
              )}

              {/* Observations List */}
              <div className="space-y-4">
                {observations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No observations yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      Add observations about this task or nearby panels
                    </p>
                  </div>
                ) : (
                  observations.map((observation) => (
                    <div key={observation._id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {observation.author?.firstName} {observation.author?.lastName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(observation.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {observation.author?._id === user._id && (
                          <button
                            onClick={() => handleDeleteObservation(observation._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {observation.text && (
                        <p className="text-gray-700 dark:text-gray-300 mb-3">{observation.text}</p>
                      )}

                      {observation.images && observation.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {observation.images.map((img, index) => (
                            <a
                              key={index}
                              href={`http://localhost:8000${img.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={`http://localhost:8000${img.url}`}
                                alt={img.description || `Observation image ${index + 1}`}
                                className="w-full h-32 object-cover rounded hover:opacity-90 transition-opacity"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned To</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {task.assignedTo?.firstName} {task.assignedTo?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created By</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {task.createdBy?.firstName} {task.createdBy?.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
            </div>
            <div className="card-body">
              <div className="space-y-2">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Status changes can only be made by administrators
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default TaskDetail
