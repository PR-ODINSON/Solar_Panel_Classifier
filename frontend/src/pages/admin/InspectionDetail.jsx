import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, MapPin, Calendar, Camera, Thermometer, AlertTriangle, CheckCircle, FileText, Eye } from 'lucide-react'
import api from '../../api/apiClient.js'

const InspectionDetail = () => {
  const { id } = useParams()
  const [inspection, setInspection] = useState(null)
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [defectsLoading, setDefectsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Fetch inspection data and related defects
  useEffect(() => {
    const fetchInspection = async () => {
      try {
        setLoading(true)
        const response = await api.inspections.get(id)
        setInspection(response.data.inspection)
        setError(null)
        
        // Fetch defects related to this inspection
        setDefectsLoading(true)
        try {
          const defectsResponse = await api.defects.list({ inspection: id })
          setDefects(defectsResponse.data?.defects || [])
        } catch (defectErr) {
          console.error('Error fetching defects:', defectErr)
          setDefects([])
        } finally {
          setDefectsLoading(false)
        }
      } catch (err) {
        console.error('Error fetching inspection:', err)
        setError('Failed to load inspection details')
        setInspection(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchInspection()
    }
  }, [id])

  const getDefectIcon = (type) => {
    switch (type) {
      case 'crack': return <AlertTriangle className="h-4 w-4" />
      case 'hotspot': return <Thermometer className="h-4 w-4" />
      case 'soiling': return <FileText className="h-4 w-4" />
      case 'other': return <FileText className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getDefectColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'immediate': return 'text-red-700 bg-red-200'
      case 'high': return 'text-orange-700 bg-orange-200'
      case 'medium': return 'text-yellow-700 bg-yellow-200'
      case 'low': return 'text-green-700 bg-green-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-200'
      case 'scheduled': return 'text-blue-700 bg-blue-200'
      case 'pending': return 'text-gray-700 bg-gray-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/inspections"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Loading...
            </h1>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Loading inspection details...
            </h3>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/inspections"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Error
            </h1>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error Loading Inspection
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Link to="/inspections" className="btn-primary">
              Back to Inspections
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!inspection) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/inspections"
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {inspection.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {inspection.description || 'AI-generated inspection report'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {inspection.filename && (
            <a
              href={`/download/${inspection.filename}`}
              download
              className="btn-secondary inline-flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download Excel
            </a>
          )}
          {inspection.annotated_image && (
            <a
              href={`/download/${inspection.annotated_image}`}
              download
              className="btn-secondary inline-flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Image
            </a>
          )}
        </div>
      </div>

      {/* Inspection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Report Information
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Created Date</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(inspection.date).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Report File</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.filename}</p>
                  {inspection.file_size && (
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Size: {(inspection.file_size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    inspection.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}>
                    {inspection.status?.toUpperCase() || 'COMPLETED'}
                  </span>
                </div>
              </div>
              
              {inspection.annotated_image && (
                <div className="flex items-center">
                  <Camera className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Annotated Image</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.annotated_image}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI Analysis Summary */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              AI Analysis Summary
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Analysis Description
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {inspection.ai_summary || 'This report contains detailed AI-generated analysis of solar panel conditions, including defect detection and classification using computer vision technology.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Report Type
                  </p>
                  <p className="text-lg font-semibold text-blue-700 dark:text-blue-400">
                    AI Classification
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-300">
                    Data Format
                  </p>
                  <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                    Excel Report
                  </p>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  ⚠️ Note: Detailed defect analysis is available in the Excel report
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  The Excel report contains comprehensive data including panel classifications, confidence scores, bounding box coordinates, and statistical summaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Results */}
      {inspection.aiAnalysis && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Detailed Analysis Results
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Analysis Metrics */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Analysis Metrics
                </h4>
                <div className="space-y-3">
                  {inspection.aiAnalysis.totalPanelsAnalyzed && (
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Total Panels Detected</span>
                      <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                        {inspection.aiAnalysis.totalPanelsAnalyzed}
                      </span>
                    </div>
                  )}
                  
                  {inspection.location?.coordinates && (
                    <>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">GPS Latitude</span>
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                          {inspection.location.coordinates.latitude?.toFixed(6)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">GPS Longitude</span>
                        <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                          {inspection.location.coordinates.longitude?.toFixed(6)}
                        </span>
                      </div>
                    </>
                  )}
                  
                  {inspection.aiAnalysis.confidence && (
                    <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">AI Confidence</span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {inspection.aiAnalysis.confidence}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Classification Breakdown */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Classification Breakdown
                </h4>
                <div className="space-y-3">
                  {inspection.aiAnalysis.defectsSummary && (
                    <>
                      {inspection.aiAnalysis.defectsSummary.clean > 0 && (
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Clean Panels</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                              {inspection.aiAnalysis.defectsSummary.clean}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({Math.round((inspection.aiAnalysis.defectsSummary.clean / inspection.aiAnalysis.totalPanelsAnalyzed) * 100)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {inspection.aiAnalysis.defectsSummary.high > 0 && (
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Physical-Damage Panels</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                              {inspection.aiAnalysis.defectsSummary.high}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({Math.round((inspection.aiAnalysis.defectsSummary.high / inspection.aiAnalysis.totalPanelsAnalyzed) * 100)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {inspection.aiAnalysis.defectsSummary.critical > 0 && (
                        <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Dusty Panels</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                              {inspection.aiAnalysis.defectsSummary.critical}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({Math.round((inspection.aiAnalysis.defectsSummary.critical / inspection.aiAnalysis.totalPanelsAnalyzed) * 100)}%)
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {inspection.aiAnalysis.defectsSummary.low > 0 && (
                        <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">Bird-drop Panels</span>
                          <div className="text-right">
                            <span className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                              {inspection.aiAnalysis.defectsSummary.low}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              ({Math.round((inspection.aiAnalysis.defectsSummary.low / inspection.aiAnalysis.totalPanelsAnalyzed) * 100)}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Overall Health Status */}
            {inspection.healthScore && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-lg font-medium text-gray-900 dark:text-white">
                      Overall Health Status
                    </h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Percentage of clean panels in good condition
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-bold ${
                      inspection.healthScore >= 80 ? 'text-green-600 dark:text-green-400' :
                      inspection.healthScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {inspection.healthScore}%
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Health Score
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Access Information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Report Access & Downloads
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Available Files
              </h4>
              
              {inspection.filename && (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Excel Report
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {inspection.filename}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/download/${inspection.filename}`}
                    download
                    className="btn-secondary text-sm"
                  >
                    Download
                  </a>
                </div>
              )}
              
              {inspection.annotated_image && (
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Camera className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Annotated Image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {inspection.annotated_image}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/download/${inspection.annotated_image}`}
                    download
                    className="btn-secondary text-sm"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900 dark:text-white">
                Report Contents
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Summary statistics and panel counts
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Detailed classification results
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Confidence scores and bounding boxes
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  GPS coordinates (if available)
                </div>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Multiple worksheets with charts
                </div>
              </div>
            </div>
          </div>
          
          {/* Detected Defects Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                Detected Defects
              </h4>
              {defects.length > 0 && (
                <Link 
                  to={`/defects?inspection=${id}`}
                  className="btn-secondary text-sm inline-flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All Defects
                </Link>
              )}
            </div>
            
            {defectsLoading ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="animate-pulse flex space-x-4">
                  <div className="rounded-full bg-gray-300 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ) : defects.length > 0 ? (
              <div className="space-y-3">
                {defects.slice(0, 5).map((defect) => (
                  <div key={defect._id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getDefectColor(defect.severity)}`}>
                          {getDefectIcon(defect.defectType)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                              {defect.defectId}
                            </h5>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDefectColor(defect.severity)}`}>
                              {defect.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                            {defect.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>Type: {defect.defectType.replace('_', ' ')}</span>
                            <span>Affected: {defect.impact?.affectedPanels || 'N/A'} panels</span>
                            <span>Method: {defect.detectionMethod?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      <Link
                        to={`/defects/${defect._id}`}
                        className="btn-secondary text-xs"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
                {defects.length > 5 && (
                  <div className="text-center">
                    <Link 
                      to={`/defects?inspection=${id}`}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all {defects.length} defects →
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <h5 className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                  No Defects Detected
                </h5>
                <p className="text-sm text-green-700 dark:text-green-400">
                  This inspection found no defects. All panels appear to be in good condition.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InspectionDetail
