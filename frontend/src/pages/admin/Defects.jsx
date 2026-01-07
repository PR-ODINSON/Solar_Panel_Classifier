import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, AlertTriangle, Thermometer, FileText, MapPin, Calendar, Eye, Wrench, Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'

const Defects = () => {
  const { isAdmin, user } = useAuth()
  const { toasts, removeToast, success, error, warning } = useToast()
  const [searchParams] = useSearchParams()
  const inspectionFilter = searchParams.get('inspection')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [defects, setDefects] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState(null)
  const [stats, setStats] = useState({})
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 10
  })
  const [maintenanceStaff, setMaintenanceStaff] = useState([])
  const [inspectionInfo, setInspectionInfo] = useState(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedDefect, setSelectedDefect] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState('')

  // Fetch defects from API
  const fetchDefects = async (params = {}) => {
    try {
      setLoading(true)
      setErrorState(null)
      
      const queryParams = {
        page: pagination.current,
        limit: pagination.limit,
        search: searchTerm || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        severity: filterSeverity !== 'all' ? filterSeverity : undefined,
        defectType: filterType !== 'all' ? filterType : undefined,
        inspection: inspectionFilter || undefined,
        ...params
      }

      // Remove undefined values
      Object.keys(queryParams).forEach(key => 
        queryParams[key] === undefined && delete queryParams[key]
      )

      const response = await api.defects.list(queryParams)
      
      if (response.success) {
        setDefects(response.data.defects || [])
        setPagination(response.data.pagination || pagination)
      } else {
        setErrorState('Failed to fetch defects')
        error('Failed to fetch defects')
      }
    } catch (err) {
      console.error('Error fetching defects:', err)
      setErrorState('Failed to fetch defects')
      error('Failed to fetch defects')
    } finally {
      setLoading(false)
    }
  }

  // Fetch defect statistics
  const fetchStats = async () => {
    try {
      const response = await api.defects.getStats()
      if (response.success) {
        setStats(response.data)
      }
    } catch (err) {
      console.error('Error fetching defect stats:', err)
    }
  }

  // Fetch maintenance staff for assignment
  const fetchMaintenanceStaff = async () => {
    try {
      if (isAdmin()) {
        const response = await api.users.getMaintenanceStaff()
        if (response.success) {
          setMaintenanceStaff(response.data.users || [])
        }
      }
    } catch (err) {
      console.error('Error fetching maintenance staff:', err)
    }
  }

  // Fetch inspection info when filtering by inspection
  const fetchInspectionInfo = async (inspectionId) => {
    try {
      const response = await api.inspections.get(inspectionId)
      if (response.success) {
        setInspectionInfo(response.data.inspection)
      }
    } catch (err) {
      console.error('Error fetching inspection info:', err)
    }
  }

  // Handle defect assignment
  const handleAssignDefect = async (defectId, assignedToId) => {
    try {
      const response = await api.defects.update(defectId, { assignedTo: assignedToId })
      if (response.success) {
        // Refresh defects list
        fetchDefects()
      }
    } catch (err) {
      console.error('Error assigning defect:', err)
      error('Failed to assign defect')
    }
  }

  // Handle status update
  const handleStatusUpdate = async (defectId, newStatus) => {
    try {
      const response = await api.defects.update(defectId, { status: newStatus })
      if (response.success) {
        // Refresh defects list
        fetchDefects()
      }
    } catch (err) {
      console.error('Error updating defect status:', err)
      error('Failed to update defect status')
    }
  }

  // Assign defect to maintenance staff (defect becomes a task automatically)
  const handleAssignDefectToStaff = (defect) => {
    setSelectedDefect(defect)
    setShowAssignModal(true)
    setSelectedStaff('') // Reset selection
  }

  // Assign defect to selected staff member
  const handleConfirmAssignment = async () => {
    if (!selectedStaff) {
      error('Please select a maintenance staff member')
      return
    }

    try {
      // Update defect with assignment and status
      const response = await api.defects.update(selectedDefect._id, { 
        assignedTo: selectedStaff,
        status: 'in_progress'
      })
      
      if (response.success) {
        success(`Defect assigned successfully! The maintenance staff can now see this in their tasks.`)
        fetchDefects()
        setShowAssignModal(false)
        setSelectedDefect(null)
        setSelectedStaff('')
      }
    } catch (err) {
      console.error('Error assigning defect:', err)
      error('Failed to assign defect')
    }
  }

  // Initial load
  useEffect(() => {
    fetchDefects()
    fetchStats()
    fetchMaintenanceStaff()
    
    // Fetch inspection info if filtering by inspection
    if (inspectionFilter) {
      fetchInspectionInfo(inspectionFilter)
    }
  }, [inspectionFilter])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDefects({ page: 1 })
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [searchTerm, filterType, filterSeverity, filterStatus])

  // Use actual defects data (filtering is done server-side)
  const displayDefects = defects

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

  const getTypeColor = (type) => {
    switch (type) {
      case 'crack': return 'text-red-600 bg-red-100'
      case 'hotspot': return 'text-orange-600 bg-orange-100'
      case 'soiling': return 'text-yellow-600 bg-yellow-100'
      case 'shading': return 'text-purple-600 bg-purple-100'
      case 'corrosion': return 'text-red-600 bg-red-100'
      case 'delamination': return 'text-pink-600 bg-pink-100'
      case 'discoloration': return 'text-yellow-600 bg-yellow-100'
      case 'burn_mark': return 'text-red-600 bg-red-100'
      case 'cell_failure': return 'text-red-600 bg-red-100'
      case 'junction_box_issue': return 'text-orange-600 bg-orange-100'
      case 'wiring_issue': return 'text-orange-600 bg-orange-100'
      case 'mounting_issue': return 'text-purple-600 bg-purple-100'
      case 'glass_breakage': return 'text-red-600 bg-red-100'
      case 'frame_damage': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'text-red-800 bg-red-200'
      case 'high': return 'text-red-700 bg-red-200'
      case 'medium': return 'text-yellow-700 bg-yellow-200'
      case 'low': return 'text-green-700 bg-green-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-gray-700 bg-gray-200'
      case 'in_progress': return 'text-blue-700 bg-blue-200'
      case 'resolved': return 'text-green-700 bg-green-200'
      case 'closed': return 'text-green-800 bg-green-300'
      case 'deferred': return 'text-purple-700 bg-purple-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-red-600'
      case 'high': return 'border-l-4 border-orange-500'
      case 'medium': return 'border-l-4 border-yellow-500'
      case 'low': return 'border-l-4 border-green-500'
      default: return 'border-l-4 border-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Defect Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage detected defects, classification, and repair scheduling
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => fetchDefects()}
            disabled={loading}
            className="btn-secondary inline-flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {isAdmin() && (
            <>
              <button className="btn-secondary inline-flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </button>
              <Link to="/inspections" className="btn-primary inline-flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Inspections
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Inspection Filter Banner */}
      {inspectionFilter && inspectionInfo && (
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                Showing defects from Inspection: {inspectionInfo.inspectionId}
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Date: {new Date(inspectionInfo.inspectionDate).toLocaleDateString()} | 
                Health Score: {inspectionInfo.healthScore}% | 
                Priority: {inspectionInfo.priority?.toUpperCase()} |
                AI Defects Found: {inspectionInfo.aiAnalysis?.detectedDefects?.length || inspectionInfo.aiAnalysis?.defectsSummary?.total || 0}
              </p>
            </div>
            <Link
              to="/defects"
              className="btn-secondary text-sm inline-flex items-center"
            >
              View All Defects
            </Link>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stats.total || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Defects</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {stats.open || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Open</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-blue-600 dark:text-blue-400">
              {defects.filter(d => d.status === 'in_progress').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">In Progress</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-orange-600 dark:text-orange-400">
              {stats.critical || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Critical</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {stats.resolved || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Resolved</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Defects
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search defects..."
                  className="input-field pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                className="input-field"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="crack">Cracks</option>
                <option value="hotspot">Hot Spots</option>
                <option value="soiling">Soiling</option>
                <option value="shading">Shading</option>
                <option value="corrosion">Corrosion</option>
                <option value="delamination">Delamination</option>
                <option value="discoloration">Discoloration</option>
                <option value="burn_mark">Burn Mark</option>
                <option value="cell_failure">Cell Failure</option>
                <option value="junction_box_issue">Junction Box</option>
                <option value="wiring_issue">Wiring Issue</option>
                <option value="mounting_issue">Mounting Issue</option>
                <option value="glass_breakage">Glass Breakage</option>
                <option value="frame_damage">Frame Damage</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <select
                className="input-field"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
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
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
                <option value="deferred">Deferred</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {defects.length} of {pagination.total} defects
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="card">
          <div className="card-body text-center py-12">
            <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Loading defects...
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we fetch the latest defect data.
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {errorState && !loading && (
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Error loading defects
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {errorState}
            </p>
            <button 
              onClick={() => fetchDefects()}
              className="btn-primary inline-flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Defects list */}
      {!loading && !errorState && (
      <div className="space-y-4">
          {displayDefects.map((defect) => (
          <div key={defect._id} className={`card ${getPriorityColor(defect.priority)}`}>
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(defect.defectType)}`}>
                    {getDefectIcon(defect.defectType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {defect.defectId}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(defect.defectType)}`}>
                        {defect.defectType.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(defect.severity)}`}>
                        {defect.severity.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(defect.status)}`}>
                        {defect.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                      {defect.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-1">{defect.location?.description || 'N/A'}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Detected:</span>
                        <span className="ml-1">{new Date(defect.detectedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Affected Panels:</span>
                        <span className="ml-1 text-orange-600 dark:text-orange-400">
                          {defect.impact?.affectedPanels || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Detection Method:</span>
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          {defect.detectionMethod?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {defect.assignedTo ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      Assigned to: {defect.assignedTo.firstName} {defect.assignedTo.lastName}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Unassigned
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400">
                    Priority: {defect.priority}
                  </span>
                  {defect.resolution?.resolvedDate && (
                    <span className="text-green-600 dark:text-green-400">
                      Resolved: {new Date(defect.resolution.resolvedDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link
                    to={isAdmin() ? `/defects/${defect._id}` : `/maintenance/defects/${defect._id}`}
                    className="btn-secondary text-sm inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                  
                  {isAdmin() && defect.status === 'open' && !defect.assignedTo && (
                    <button
                      onClick={() => handleAssignDefectToStaff(defect)}
                      className="btn-primary text-sm inline-flex items-center"
                      title="Assign defect to maintenance staff"
                    >
                      <Wrench className="h-4 w-4 mr-1" />
                      Assign Task
                    </button>
                  )}
                  
                  {defect.status !== 'resolved' && defect.status !== 'closed' && (
                    <select
                      className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1"
                      value={defect.status}
                      onChange={(e) => handleStatusUpdate(defect._id, e.target.value)}
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
            </div>
          </div>
        ))}

        {displayDefects.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No defects found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
                No defects match your current filters or no defects have been detected yet.
            </p>
            {isAdmin() && (
              <Link to="/inspections" className="btn-primary inline-flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Inspections
              </Link>
            )}
          </div>
          </div>
        )}
        </div>
      )}
      
      {/* Defect Assignment Modal */}
      {showAssignModal && selectedDefect && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Assign Defect to Staff
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Assigning defect: <span className="font-medium">{selectedDefect.defectId}</span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Type: <span className="font-medium">{selectedDefect.defectType.replace('_', ' ')}</span> | 
                    Severity: <span className="font-medium">{selectedDefect.severity}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    Note: This defect will automatically appear as a task for the assigned staff member.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assign to Maintenance Staff *
                  </label>
                  <select
                    className="input-field w-full"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                  >
                    <option value="">Select staff member...</option>
                    {maintenanceStaff.map(staff => (
                      <option key={staff._id} value={staff._id}>
                        {staff.firstName} {staff.lastName} - {staff.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedDefect(null)
                    setSelectedStaff('')
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAssignment}
                  disabled={!selectedStaff}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign Defect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Defects
