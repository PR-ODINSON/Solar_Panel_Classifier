import React, { useState, useEffect, useRef } from 'react'
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
import { Button, Input, Badge, Card, Skeleton, EmptyState } from '../../components/ui'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, removeToast, success, error, info } = useToast()
  const fileInputRef = useRef(null)
  
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
      // Fetch maintenance task details
      const response = await api.maintenance.get(id)
      console.log('Task response:', response) // Debug log
      
      // Consistent response structure from backend
      const taskData = response.data?.task
      
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
      // Use maintenance API for observations
      const response = await api.maintenance.getObservations(id)
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

      // Use maintenance API for observations
      const response = await api.maintenance.addObservation(id, observationData)
      
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
      // Use maintenance API for observations
      await api.maintenance.deleteObservation(id, observationId)
      success('Observation deleted successfully')
      fetchObservations()
    } catch (err) {
      console.error('Error deleting observation:', err)
      error('Failed to delete observation')
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton.Card />
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
          <div className="space-y-6">
            <Skeleton.Card />
          </div>
        </div>
      </div>
    )
  }

  if (!task) {
    return (
      <div className="p-6">
        <EmptyState
          icon={<AlertTriangle />}
          title="Task Not Found"
          message="The task you're looking for doesn't exist or has been removed."
        >
          <Button onClick={() => navigate('/maintenance/dashboard')}>
            Back to Dashboard
          </Button>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft />}
          className="mb-4"
        >
          Back
        </Button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{task.taskId}</p>
          </div>
          <div className="flex space-x-2">
            <Badge priority={task.priority}>{task.priority}</Badge>
            <Badge status={task.status}>{task.status?.replace('_', ' ')}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Related Defect Info (if exists) */}
          {task.relatedDefect && (
            <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
              <Card.Header className="border-orange-200 dark:border-orange-800">
                <h3 className="text-lg font-medium text-orange-900 dark:text-orange-200">Related Defect</h3>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-xs font-medium text-orange-700 dark:text-orange-300">Defect ID</label>
                    <p className="mt-1 text-orange-900 dark:text-orange-100">{task.relatedDefect.defectId}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-orange-700 dark:text-orange-300">Type</label>
                    <p className="mt-1 text-orange-900 dark:text-orange-100 capitalize">
                      {task.relatedDefect.defectType?.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-orange-700 dark:text-orange-300">Severity</label>
                    <p className="mt-1 text-orange-900 dark:text-orange-100 capitalize">{task.relatedDefect.severity}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-orange-700 dark:text-orange-300">Status</label>
                    <p className="mt-1 text-orange-900 dark:text-orange-100 capitalize">
                      {task.relatedDefect.status?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                {task.relatedDefect.description && (
                  <div className="mt-3">
                    <label className="text-xs font-medium text-orange-700 dark:text-orange-300">Defect Description</label>
                    <p className="mt-1 text-sm text-orange-900 dark:text-orange-100">{task.relatedDefect.description}</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Task Details */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Task Details</h3>
            </Card.Header>
            <Card.Body>
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
            </Card.Body>
          </Card>

          {/* Observations Section */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Extra Observations</h3>
                <Button
                  size="sm"
                  onClick={() => setShowAddObservation(!showAddObservation)}
                >
                  {showAddObservation ? 'Cancel' : 'Add Observation'}
                </Button>
              </div>
            </Card.Header>
            <Card.Body>
              {/* Add Observation Form */}
              {showAddObservation && (
                <div className="mb-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">New Observation</h4>
                  
                  {/* Text Input */}
                  <Input
                    as="textarea"
                    label="Details"
                    value={observationText}
                    onChange={(e) => setObservationText(e.target.value)}
                    placeholder="Add any additional observations about this task or nearby panels..."
                    rows={4}
                    className="mb-4"
                  />

                  {/* Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Images (Optional)
                    </label>
                    <div className="flex items-center space-x-2 mb-3">
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        leftIcon={<Upload className="h-4 w-4" />}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Choose Images
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        max="5"
                      />
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
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute top-1 right-1 !p-1 rounded-full"
                            >
                              <X className="h-3 w-3" />
                            </Button>
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
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowAddObservation(false)
                        setObservationText('')
                        setObservationImages([])
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmitObservation}
                      disabled={submitting || (!observationText.trim() && observationImages.length === 0)}
                      loading={submitting}
                      leftIcon={<Save />}
                    >
                      {submitting ? 'Saving...' : 'Save Observation'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Observations List */}
              <div className="space-y-4">
                {observations.length === 0 ? (
                  <EmptyState
                    icon={<FileText />}
                    title="No observations yet"
                    message="Add observations about this task or nearby panels"
                  />
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteObservation(observation._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
            </Card.Body>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Assignment</h3>
            </Card.Header>
            <Card.Body>
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
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Quick Actions</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <AlertTriangle className="h-4 w-4 inline mr-2" />
                    Status changes can only be made by administrators
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default TaskDetail
