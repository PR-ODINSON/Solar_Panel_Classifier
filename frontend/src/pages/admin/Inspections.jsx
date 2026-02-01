import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Calendar, MapPin, Camera, Download, Eye, FileText, AlertTriangle, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { Button, Badge, Skeleton, EmptyState } from '../../components/ui'

const Inspections = () => {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch real inspection data from backend
  useEffect(() => {
    const fetchInspections = async () => {
      try {
        setLoading(true)
        const response = await api.inspections.list()
        setInspections(response.data.inspections || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching inspections:', err)
        setError('Failed to load inspection reports')
        setInspections([])
      } finally {
        setLoading(false)
      }
    }

    fetchInspections()
  }, [])

  // Delete inspection
  const handleDeleteInspection = async (inspectionId, inspectionIdDisplay) => {
    if (!window.confirm(`Are you sure you want to delete inspection ${inspectionIdDisplay}? This action cannot be undone and will also delete all related defects.`)) {
      return
    }

    try {
      const response = await api.inspections.delete(inspectionId)
      if (response.success) {
        alert('Inspection deleted successfully')
        // Refresh the list
        const updatedResponse = await api.inspections.list()
        setInspections(updatedResponse.data.inspections || [])
      }
    } catch (err) {
      console.error('Error deleting inspection:', err)
      alert('Failed to delete inspection')
    }
  }

  // Download functionality
  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`http://localhost:8000/download/${filename}`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Download failed. Please try again.')
    }
  }

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = (inspection.inspectionId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inspection.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inspection.panel?.panelId || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      scheduled: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  const getDefectSeverity = (defectCount, totalPanels) => {
    if (!defectCount || !totalPanels) return null
    const percentage = (defectCount / totalPanels) * 100
    if (percentage > 15) return 'high'
    if (percentage > 5) return 'medium'
    return 'low'
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inspection Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage drone inspection reports and AI-detected defects
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" leftIcon={<Download />}>
            Export All
          </Button>
          {isAdmin() && (
            <Link to="/upload-infer">
              <Button leftIcon={<Camera />}>
                New Inspection
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {inspections.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Inspections</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {inspections.filter(i => i.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {inspections.filter(i => i.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
              {inspections.reduce((sum, i) => sum + (i.aiAnalysis?.detectedDefects?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">AI Defects Found</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Inspections
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by ID, location, or inspector..."
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
                <option value="completed">Completed</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                className="input-field"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredInspections.length} of {inspections.length} inspections
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
        </div>
      )}

      {/* Error State */}
      {error && (
        <EmptyState
          icon={<AlertTriangle />}
          title="Error Loading Reports"
          message={error}
        >
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </EmptyState>
      )}

      {/* Inspections list */}
      {!loading && !error && (
        <div className="space-y-4">
          {filteredInspections.map((inspection) => (
            <div key={inspection._id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {inspection.inspectionId}
                        </h3>
                        <Badge status={inspection.status}>
                          {inspection.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {inspection.overallRating && (
                          <Badge severity={inspection.overallRating}>
                            {inspection.overallRating?.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {inspection.healthScore || 0}%
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Health Score</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Date:</span>
                        <span className="ml-1">{new Date(inspection.inspectionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Priority:</span>
                        <span className="ml-1 capitalize">{inspection.priority}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Inspector:</span>
                        <span className="ml-1">
                          {inspection.inspector ? `${inspection.inspector.firstName} ${inspection.inspector.lastName}` : 'AI System'}
                        </span>
                      </div>
                    </div>

                    {/* AI Analysis Summary */}
                    {inspection.aiAnalysis?.conducted && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-lg mb-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              AI Analysis Completed
                            </div>
                            <div className="text-xs text-blue-700 dark:text-blue-300">
                              Confidence: {inspection.aiAnalysis.confidence || 0}% | 
                              Defects Found: {inspection.aiAnalysis.detectedDefects?.length || inspection.aiAnalysis.defectsSummary?.total || 0}
                            </div>
                          </div>
                          {inspection.aiAnalysis.processedImageUrl && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Processed Images Available
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Weather Information */}
                    {inspection.weather && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Weather: {inspection.weather.conditions} 
                        {inspection.weather.temperature && ` | ${inspection.weather.temperature}°C`}
                        {inspection.weather.humidity && ` | ${inspection.weather.humidity}% humidity`}
                      </div>
                    )}

                    {/* Notes */}
                    {inspection.notes && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        <span className="font-medium">Notes:</span> {inspection.notes}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {inspection.aiAnalysis?.conducted ? 'AI-generated inspection with automated defect detection' : 'Manual inspection report'}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link to={`/inspections/${inspection._id}`}>
                      <Button variant="secondary" size="sm" leftIcon={<Eye />}>
                        View Details
                      </Button>
                    </Link>
                    
                    {/* Link to defects if any were found */}
                    {(inspection.aiAnalysis?.detectedDefects?.length > 0 || inspection.aiAnalysis?.defectsSummary?.total > 0) && (
                      <Link to={`/defects?inspection=${inspection._id}`}>
                        <Button size="sm" leftIcon={<AlertTriangle />}>
                          View Defects ({inspection.aiAnalysis?.detectedDefects?.length || inspection.aiAnalysis?.defectsSummary?.total || 0})
                        </Button>
                      </Link>
                    )}
                    
                    {/* Download buttons for AI analysis results */}
                    {inspection.aiAnalysis?.processedImageUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<Download />}
                        onClick={() => {
                          const filename = inspection.aiAnalysis.processedImageUrl.replace('/outputs/', '')
                          handleDownload(filename)
                        }}
                      >
                        Download Image
                      </Button>
                    )}
                    
                    {/* Download Excel report if available */}
                    {inspection.aiAnalysis?.processedImageUrl && (
                      <Button
                        variant="secondary"
                        size="sm"
                        leftIcon={<FileText />}
                        onClick={() => {
                          const baseFilename = inspection.aiAnalysis.processedImageUrl.replace('/outputs/', '').replace('_annotated.jpg', '')
                          const excelFilename = `${baseFilename}_report.xlsx`
                          handleDownload(excelFilename)
                        }}
                      >
                        Download Excel
                      </Button>
                    )}
                    
                    {isAdmin() && (
                      <Button
                        variant="danger"
                        size="sm"
                        leftIcon={<Trash2 />}
                        onClick={() => handleDeleteInspection(inspection._id, inspection.inspectionId)}
                        title="Delete inspection"
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && filteredInspections.length === 0 && (
        <EmptyState
          icon={<FileText />}
          title="No inspection reports found"
          message={
            inspections.length === 0
              ? 'No inspection reports have been generated yet. Upload and process some images to create your first report.'
              : 'No inspection reports match your current search filters.'
          }
        >
          {isAdmin() && (
            <Link to="/upload-infer">
              <Button leftIcon={<Camera />}>
                Start New Inspection
              </Button>
            </Link>
          )}
        </EmptyState>
      )}
    </div>
  )
}

export default Inspections
