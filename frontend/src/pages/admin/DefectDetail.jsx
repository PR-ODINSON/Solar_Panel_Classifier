import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Thermometer, FileText, Camera, Download, Wrench, CheckCircle, RefreshCw, MessageSquare, ExternalLink, Eye, ZoomIn } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'
import { Button, Input, Badge, Modal, Card, Skeleton, EmptyState } from '../../components/ui'

const DefectDetail = () => {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const { toasts, removeToast, success, error } = useToast()
  
  const [defect, setDefect] = useState(null)
  const [inspectionData, setInspectionData] = useState(null)
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Fetch defect details and related inspection
  const fetchDefect = async () => {
    try {
      setLoading(true)
      setErrorState(null)
      const response = await api.defects.get(id)
      if (response.success) {
        setDefect(response.data.defect)
        
        // Fetch inspection data if available
        if (response.data.defect.inspection) {
          try {
            const inspectionResponse = await api.inspections.get(response.data.defect.inspection._id || response.data.defect.inspection)
            if (inspectionResponse.success) {
              setInspectionData(inspectionResponse.data.inspection)
            }
          } catch (inspErr) {
            console.error('Error fetching inspection:', inspErr)
            // Don't fail the whole request if inspection fetch fails
          }
        }
        
        // Fetch observations from maintenance staff
        try {
          const obsResponse = await api.defects.getObservations(id)
          if (obsResponse.success) {
            setObservations(obsResponse.data.observations || [])
          }
        } catch (obsErr) {
          console.error('Error fetching observations:', obsErr)
          // Don't fail the whole request if observations fetch fails
        }
      } else {
        setErrorState('Failed to fetch defect details')
        error('Failed to fetch defect details')
      }
    } catch (err) {
      console.error('Error fetching defect:', err)
      setErrorState('Failed to fetch defect details')
      error('Failed to fetch defect details')
    } finally {
      setLoading(false)
    }
  }

  // Add note to defect
  const handleAddNote = async () => {
    if (!newNote.trim()) return
    
    try {
      setAddingNote(true)
      const response = await api.defects.addNote(id, newNote.trim())
      if (response.success) {
        setDefect(response.data.defect)
        setNewNote('')
        success('Note added successfully')
      }
    } catch (err) {
      console.error('Error adding note:', err)
      error('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  // Update defect status (admin only)
  const handleStatusUpdate = async (newStatus) => {
    if (!isAdmin()) {
      error('Only administrators can change defect status')
      return
    }
    
    try {
      const response = await api.defects.update(id, { status: newStatus })
      if (response.success) {
        setDefect(response.data.defect)
        success(`Defect status updated to ${newStatus.replace('_', ' ')}`)
      }
    } catch (err) {
      console.error('Error updating status:', err)
      error('Failed to update status')
    }
  }

  // Helper function to open Google Maps
  const openInGoogleMaps = (coordinates) => {
    if (coordinates && coordinates.latitude && coordinates.longitude) {
      const url = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=18`
      window.open(url, '_blank')
    }
  }

  // Helper function to get affected panels analysis
  const getAffectedPanelsAnalysis = () => {
    if (!defect?.impact?.affectedPanels) return null
    
    const count = defect.impact.affectedPanels
    let severity = 'low'
    let description = 'Minimal impact'
    
    if (count > 20) {
      severity = 'high'
      description = 'Significant impact on system performance'
    } else if (count > 10) {
      severity = 'medium' 
      description = 'Moderate impact on system performance'
    }
    
    return { count, severity, description }
  }

  useEffect(() => {
    fetchDefect()
  }, [id])

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton.Card />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
          <div className="space-y-6">
            <Skeleton.Card />
            <Skeleton.Card />
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (errorState) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={isAdmin() ? "/defects" : "/maintenance/defects"}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Defect Details
            </h1>
          </div>
        </div>
        
        <EmptyState
          icon={<AlertTriangle />}
          title="Error loading defect"
          message={errorState}
        >
          <Button onClick={fetchDefect} leftIcon={<RefreshCw />}>
            Try Again
          </Button>
        </EmptyState>
      </div>
    )
  }

  // No defect found
  if (!defect) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={isAdmin() ? "/defects" : "/maintenance/defects"}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Defect Not Found
            </h1>
          </div>
        </div>
        
        <EmptyState
          icon={<AlertTriangle />}
          title="Defect not found"
          message="The defect you're looking for doesn't exist or you don't have permission to view it."
        >
          <Link to={isAdmin() ? "/defects" : "/maintenance/defects"}>
            <Button leftIcon={<ArrowLeft />}>
              Back to Defects
            </Button>
          </Link>
        </EmptyState>
      </div>
    )
  }

  const getDefectIcon = (type) => {
    switch (type) {
      case 'crack': return <AlertTriangle className="h-5 w-5" />
      case 'hotspot': return <Thermometer className="h-5 w-5" />
      case 'soiling': return <FileText className="h-5 w-5" />
      case 'shading': return <FileText className="h-5 w-5" />
      case 'corrosion': return <AlertTriangle className="h-5 w-5" />
      case 'delamination': return <AlertTriangle className="h-5 w-5" />
      case 'discoloration': return <FileText className="h-5 w-5" />
      case 'burn_mark': return <AlertTriangle className="h-5 w-5" />
      case 'cell_failure': return <AlertTriangle className="h-5 w-5" />
      case 'junction_box_issue': return <AlertTriangle className="h-5 w-5" />
      case 'wiring_issue': return <AlertTriangle className="h-5 w-5" />
      case 'mounting_issue': return <AlertTriangle className="h-5 w-5" />
      case 'glass_breakage': return <AlertTriangle className="h-5 w-5" />
      case 'frame_damage': return <AlertTriangle className="h-5 w-5" />
      case 'other': return <FileText className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to={isAdmin() ? "/defects" : "/maintenance/defects"}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {defect.defectId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed defect analysis and repair information
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="secondary"
            onClick={fetchDefect}
            leftIcon={<RefreshCw />}
          >
            Refresh
          </Button>
          <Button variant="secondary" leftIcon={<Download />}>
            Export Report
          </Button>
          {isAdmin() && defect.status !== 'resolved' && defect.status !== 'closed' && (
            <select
              className="btn-primary text-sm inline-flex items-center px-3 py-2 border-0"
              value={defect.status}
              onChange={(e) => handleStatusUpdate(e.target.value)}
            >
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="deferred">Deferred</option>
            </select>
          )}
        </div>
      </div>

      {/* Defect Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Defect Information
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="info">
                      {defect.defectType.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge severity={defect.severity}>
                      {defect.severity.toUpperCase()}
                    </Badge>
                    <Badge status={defect.status}>
                      {defect.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 mr-4 mt-1">
                    {getDefectIcon(defect.defectType)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {defect.defectType.replace('_', ' ').charAt(0).toUpperCase() + defect.defectType.replace('_', ' ').slice(1)} Defect
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {defect.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Location:</span>
                        {defect.location?.coordinates ? (
                          <button
                            onClick={() => openInGoogleMaps(defect.location.coordinates)}
                            className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline inline-flex items-center"
                          >
                            {defect.location?.description || 'View on Map'}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </button>
                        ) : (
                          <span className="ml-1">{defect.location?.description || 'N/A'}</span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Detected:</span>
                        <span className="ml-1">{new Date(defect.detectedDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Affected Panels:</span>
                        <span className={`ml-1 font-semibold ${
                          getAffectedPanelsAnalysis()?.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                          getAffectedPanelsAnalysis()?.severity === 'medium' ? 'text-orange-600 dark:text-orange-400' :
                          'text-green-600 dark:text-green-400'
                        }`}>
                          {defect.impact?.affectedPanels || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Detection Method:</span>
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          {defect.detectionMethod?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Assigned To:</span>
                        <span className="ml-1">
                          {defect.assignedTo ? `${defect.assignedTo.firstName} ${defect.assignedTo.lastName}` : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Priority:</span>
                        <span className="ml-1">{defect.priority}</span>
                      </div>
                    </div>
                    
                    {/* Enhanced Affected Panels Analysis */}
                    {getAffectedPanelsAnalysis() && (
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Impact Analysis</h5>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {getAffectedPanelsAnalysis().description}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getAffectedPanelsAnalysis().severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                            getAffectedPanelsAnalysis().severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {getAffectedPanelsAnalysis().severity.toUpperCase()} IMPACT
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* GPS Coordinates Display */}
                    {defect.location?.coordinates && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">GPS Coordinates</h5>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="font-medium">Latitude:</span>
                            <span className="ml-1 font-mono">{defect.location.coordinates.latitude?.toFixed(6)}</span>
                          </div>
                          <div>
                            <span className="font-medium">Longitude:</span>
                            <span className="ml-1 font-mono">{defect.location.coordinates.longitude?.toFixed(6)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Panel Details */}
          {defect.panel && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Panel Information
                </h3>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Panel ID:</span>
                    <p className="text-gray-900 dark:text-white">{defect.panel.panelId || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Serial Number:</span>
                    <p className="text-gray-900 dark:text-white">{defect.panel.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Manufacturer:</span>
                    <p className="text-gray-900 dark:text-white">{defect.panel.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                    <p className="text-gray-900 dark:text-white">{defect.panel.model || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                    <p className="text-gray-900 dark:text-white">{defect.panel.status || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Site:</span>
                    <p className="text-gray-900 dark:text-white">{defect.panel.location?.site || 'N/A'}</p>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* AI Analysis & Images */}
        <div className="space-y-6">
          {defect.aiAnalysis && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  AI Analysis
                </h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Confidence Score:</span>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {defect.aiAnalysis.confidence ? `${defect.aiAnalysis.confidence}%` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Detection Method:</span>
                    <p className="text-gray-900 dark:text-white">{defect.detectionMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Algorithm:</span>
                    <p className="text-gray-900 dark:text-white">{defect.aiAnalysis.algorithm || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">Model Version:</span>
                    <p className="text-gray-900 dark:text-white">{defect.aiAnalysis.modelVersion || 'N/A'}</p>
                  </div>
                  {defect.aiAnalysis.processedImageUrl && (
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Processed Image:</span>
                      <p className="text-blue-600 dark:text-blue-400">Available</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Inspection Images */}
          {inspectionData && (inspectionData.images?.length > 0 || inspectionData.aiAnalysis?.processedImageUrl) && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Inspection Images
                </h3>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  {/* Processed AI Image */}
                  {inspectionData.aiAnalysis?.processedImageUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">AI Analysis Result</h4>
                      <div className="relative group">
                        <img 
                          src={`/download/${inspectionData.aiAnalysis.processedImageUrl}`}
                          alt="AI processed inspection image"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImage({
                            url: `/download/${inspectionData.aiAnalysis.processedImageUrl}`,
                            title: 'AI Analysis Result',
                            description: 'Processed image showing detected defects and analysis'
                          })}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                        <div className="hidden absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex-col items-center justify-center">
                          <Camera className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Image not available</p>
                        </div>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <ZoomIn className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Original Images */}
                  {inspectionData.images && inspectionData.images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Original Images</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {inspectionData.images.slice(0, 4).map((image, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={`/download/${image}`}
                              alt={`Inspection image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => setSelectedImage({
                                url: `/download/${image}`,
                                title: `Inspection Image ${index + 1}`,
                                description: 'Original inspection image'
                              })}
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'flex'
                              }}
                            />
                            <div className="hidden absolute inset-0 bg-gray-100 dark:bg-gray-700 rounded-lg flex-col items-center justify-center">
                              <Camera className="h-6 w-6 text-gray-400 mb-1" />
                              <p className="text-xs text-gray-500">Image not available</p>
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                              <ZoomIn className="h-6 w-6 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {inspectionData.images.length > 4 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          +{inspectionData.images.length - 4} more images available in the full inspection report
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {defect.inspection && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Related Inspection
                </h3>
              </Card.Header>
              <Card.Body>
                <Link 
                  to={`/inspections/${defect.inspection._id}`}
                  className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{defect.inspection.inspectionId}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(defect.inspection.inspectionDate).toLocaleDateString()} - View full inspection report
                      </p>
                    </div>
                    <div className="text-primary-600 dark:text-primary-400">→</div>
                  </div>
                </Link>
              </Card.Body>
            </Card>
          )}

          {/* Observations from Maintenance Staff */}
          {observations && observations.length > 0 && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Maintenance Observations
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Updates from assigned maintenance staff
                </p>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  {observations.map((obs, index) => (
                    <div key={obs._id || index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Wrench className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {obs.createdBy ? `${obs.createdBy.firstName} ${obs.createdBy.lastName}` : 'Maintenance Staff'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(obs.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {obs.text && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{obs.text}</p>
                      )}
                      {obs.images && obs.images.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                          {obs.images.map((imgUrl, imgIndex) => (
                            <div 
                              key={imgIndex} 
                              className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => setSelectedImage({
                                url: `http://localhost:8000${imgUrl}`,
                                title: `Observation Image ${imgIndex + 1}`,
                                description: obs.text || 'Maintenance observation image'
                              })}
                            >
                              <img 
                                src={`http://localhost:8000${imgUrl}`}
                                alt={`Observation ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" font-size="14" text-anchor="middle" fill="%23999" dy=".3em"%3EImage%3C/text%3E%3C/svg%3E'
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Notes Section */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Notes & Comments
              </h3>
            </Card.Header>
            <Card.Body>
              {/* Add Note Form */}
              <div className="mb-4">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note or comment..."
                  className="input-field w-full h-20 resize-none"
                />
                <div className="flex justify-end mt-2">
                  <Button
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!newNote.trim() || addingNote}
                    loading={addingNote}
                    leftIcon={<MessageSquare />}
                  >
                    {addingNote ? 'Adding...' : 'Add Note'}
                  </Button>
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-3">
                {defect.notes && defect.notes.length > 0 ? (
                  defect.notes.map((note, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {note.author ? `${note.author.firstName} ${note.author.lastName}` : 'Unknown'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No notes yet. Add the first note above.
                  </p>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Images */}
      {defect.images && defect.images.length > 0 && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Defect Images
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {defect.images.map((image, index) => (
                <div key={index} className="space-y-2">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    {image.url ? (
                      <img 
                        src={image.url} 
                        alt={image.description || 'Defect image'}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : null}
                    <div className="flex flex-col items-center justify-center">
                      <Camera className="h-12 w-12 text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Image not available</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {image.type ? image.type.charAt(0).toUpperCase() + image.type.slice(1) : 'Defect'} Image
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {image.description || 'No description available'}
                    </p>
                    {image.capturedDate && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Captured: {new Date(image.capturedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Resolution Information */}
      {defect.resolution && (defect.resolution.method || defect.resolution.description) && (
        <Card>
          <Card.Header>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Resolution Details
            </h3>
          </Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {defect.resolution.method && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Method:</span>
                  <p className="text-gray-900 dark:text-white">{defect.resolution.method}</p>
                </div>
              )}
              {defect.resolution.cost && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Cost:</span>
                  <p className="text-gray-900 dark:text-white">${defect.resolution.cost}</p>
                </div>
              )}
              {defect.resolution.timeSpent && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Time Spent:</span>
                  <p className="text-gray-900 dark:text-white">{Math.round(defect.resolution.timeSpent / 60)} hours</p>
                </div>
              )}
              {defect.resolution.resolvedBy && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Resolved By:</span>
                  <p className="text-gray-900 dark:text-white">
                    {defect.resolution.resolvedBy.firstName} {defect.resolution.resolvedBy.lastName}
                  </p>
                </div>
              )}
              {defect.resolution.description && (
                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                  <p className="text-gray-900 dark:text-white">{defect.resolution.description}</p>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
      
      {/* Image Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        title={selectedImage?.title || 'Image Preview'}
        size="xl"
      >
        <Modal.Body>
          {selectedImage && (
            <>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{selectedImage.description}</p>
              <div className="flex items-center justify-center">
                <img 
                  src={selectedImage.url}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'flex'
                  }}
                />
                <div className="hidden flex-col items-center justify-center h-64">
                  <Camera className="h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-gray-500">Image could not be loaded</p>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedImage && (
            <>
              <a
                href={selectedImage.url}
                download
              >
                <Button variant="secondary" leftIcon={<Download />}>
                  Download
                </Button>
              </a>
              <Button onClick={() => setSelectedImage(null)}>
                Close
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default DefectDetail
