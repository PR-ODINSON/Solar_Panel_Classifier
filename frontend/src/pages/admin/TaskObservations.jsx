import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User,
  FileText,
  Image as ImageIcon,
  Filter,
  Download
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'
import { Button, Badge, Skeleton, EmptyState } from '../../components/ui'

const TaskObservations = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toasts, removeToast, success, error } = useToast()
  
  const [task, setTask] = useState(null)
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterAuthor, setFilterAuthor] = useState('all')

  useEffect(() => {
    fetchTaskAndObservations()
  }, [id])

  const fetchTaskAndObservations = async () => {
    try {
      setLoading(true)
      const [taskResponse, observationsResponse] = await Promise.all([
        api.maintenance.get(id),
        api.maintenance.getObservations(id)
      ])
      
      setTask(taskResponse.data.task)
      setObservations(observationsResponse.data.observations || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      error('Failed to load task observations')
    } finally {
      setLoading(false)
    }
  }

  const filteredObservations = filterAuthor === 'all' 
    ? observations 
    : observations.filter(obs => obs.author?._id === filterAuthor)

  const uniqueAuthors = [...new Set(observations.map(obs => obs.author?._id))].filter(Boolean)

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Skeleton.Card />
        <div className="mt-6">
          <Skeleton.Card />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft />}
            onClick={() => navigate('/admin/maintenance')}
          >
            Back to Maintenance Tasks
          </Button>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Task Observations
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {task?.taskId} - {task?.title}
            </p>
          </div>
          <Badge status={task?.status}>
            {task?.status?.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      {/* Task Summary */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assigned To</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {task?.assignedTo?.firstName} {task?.assignedTo?.lastName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {task?.location?.site || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Stats */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filterAuthor}
                onChange={(e) => setFilterAuthor(e.target.value)}
                className="input w-64"
              >
                <option value="all">All Authors ({observations.length})</option>
                {uniqueAuthors.map(authorId => {
                  const author = observations.find(obs => obs.author?._id === authorId)?.author
                  const count = observations.filter(obs => obs.author?._id === authorId).length
                  return (
                    <option key={authorId} value={authorId}>
                      {author?.firstName} {author?.lastName} ({count})
                    </option>
                  )
                })}
              </select>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{filteredObservations.length} Observations</span>
              </div>
              <div className="flex items-center space-x-2">
                <ImageIcon className="h-4 w-4" />
                <span>
                  {filteredObservations.reduce((sum, obs) => sum + (obs.images?.length || 0), 0)} Images
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Observations List */}
      <div className="space-y-4">
        {filteredObservations.length === 0 ? (
          <EmptyState
            icon={<FileText />}
            title="No observations found"
            message={
              filterAuthor === 'all'
                ? 'Maintenance staff will add observations as they work on this task'
                : 'This staff member has not added any observations yet'
            }
          />
        ) : (
          filteredObservations.map((observation, index) => (
            <div key={observation._id} className="card">
              <div className="card-body">
                {/* Observation Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {observation.author?.firstName} {observation.author?.lastName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {observation.author?.username} • {observation.author?.role}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(observation.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(observation.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Observation Text */}
                {observation.text && (
                  <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {observation.text}
                    </p>
                  </div>
                )}

                {/* Observation Images */}
                {observation.images && observation.images.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        <ImageIcon className="h-4 w-4 inline mr-2" />
                        {observation.images.length} Image{observation.images.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {observation.images.map((img, imgIndex) => (
                        <a
                          key={imgIndex}
                          href={`http://localhost:8000${img.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group relative block"
                        >
                          <img
                            src={`http://localhost:8000${img.url}`}
                            alt={img.description || `Observation image ${imgIndex + 1}`}
                            className="w-full h-40 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <Download className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          {img.description && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              {img.description}
                            </p>
                          )}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Observation Footer */}
                {observation.updatedAt && observation.updatedAt !== observation.createdAt && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last updated: {new Date(observation.updatedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default TaskObservations
