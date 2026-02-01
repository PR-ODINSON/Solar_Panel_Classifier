import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Filter, AlertTriangle, Thermometer, FileText, MapPin, Calendar, Eye, Wrench, Plus, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'
import { Button, Input, Select, Badge, Modal, Card, Skeleton, EmptyState } from '../../components/ui'

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

  // Create maintenance task from defect
  const handleAssignDefectToStaff = (defect) => {
    setSelectedDefect(defect)
    setShowAssignModal(true)
    setSelectedStaff('') // Reset selection
  }

  // Create maintenance task from defect and assign to staff
  const handleConfirmAssignment = async () => {
    if (!selectedStaff) {
      error('Please select a maintenance staff member')
      return
    }

    try {
      // Create maintenance task from defect
      const response = await api.maintenance.createFromDefect(selectedDefect._id, { 
        assignedTo: selectedStaff,
        priority: selectedDefect.priority || selectedDefect.severity,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        notes: `Task created from defect ${selectedDefect.defectId}`
      })
      
      if (response.success) {
        const staffMember = maintenanceStaff.find(s => s._id === selectedStaff)
        success(`Maintenance task created and assigned to ${staffMember?.firstName} ${staffMember?.lastName}!`)
        fetchDefects()
        setShowAssignModal(false)
        setSelectedDefect(null)
        setSelectedStaff('')
      }
    } catch (err) {
      console.error('Error creating task from defect:', err)
      const errorMsg = err.response?.data?.message || 'Failed to create maintenance task'
      error(errorMsg)
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
          <Button 
            variant="secondary"
            onClick={() => fetchDefects()}
            disabled={loading}
            leftIcon={<RefreshCw className={loading ? 'animate-spin' : ''} />}
          >
            Refresh
          </Button>
          {isAdmin() && (
            <>
              <Button variant="secondary" leftIcon={<FileText />}>
                Generate Report
              </Button>
              <Link to="/inspections">
                <Button leftIcon={<AlertTriangle />}>
                  View Inspections
                </Button>
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
            <Link to="/defects">
              <Button variant="secondary" size="sm">
                View All Defects
              </Button>
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
            <Input
              label="Search Defects"
              leftIcon={<Search />}
              placeholder="Search defects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select
              label="Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'crack', label: 'Cracks' },
                { value: 'hotspot', label: 'Hot Spots' },
                { value: 'soiling', label: 'Soiling' },
                { value: 'shading', label: 'Shading' },
                { value: 'corrosion', label: 'Corrosion' },
                { value: 'delamination', label: 'Delamination' },
                { value: 'discoloration', label: 'Discoloration' },
                { value: 'burn_mark', label: 'Burn Mark' },
                { value: 'cell_failure', label: 'Cell Failure' },
                { value: 'junction_box_issue', label: 'Junction Box' },
                { value: 'wiring_issue', label: 'Wiring Issue' },
                { value: 'mounting_issue', label: 'Mounting Issue' },
                { value: 'glass_breakage', label: 'Glass Breakage' },
                { value: 'frame_damage', label: 'Frame Damage' },
                { value: 'other', label: 'Other' }
              ]}
            />

            <Select
              label="Severity"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              options={[
                { value: 'all', label: 'All Severity' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' }
              ]}
            />

            <Select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
                { value: 'deferred', label: 'Deferred' }
              ]}
            />

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
        <div className="space-y-4">
          <Skeleton.Card />
          <Skeleton.Card />
          <Skeleton.Card />
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
            <Button onClick={() => fetchDefects()} leftIcon={<RefreshCw />}>
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Defects list */}
      {!loading && !errorState && (
      <div className="space-y-4">
          {displayDefects.map((defect) => (
          <Card key={defect._id} className={`border-l-4 ${
            defect.priority === 'critical' ? 'border-red-600' :
            defect.priority === 'high' ? 'border-orange-500' :
            defect.priority === 'medium' ? 'border-yellow-500' :
            defect.priority === 'low' ? 'border-green-500' : 'border-gray-500'
          }`}>
            <Card.Body>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    {getDefectIcon(defect.defectType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {defect.defectId}
                      </h3>
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
                  <Link to={isAdmin() ? `/defects/${defect._id}` : `/maintenance/defects/${defect._id}`}>
                    <Button variant="secondary" size="sm" leftIcon={<Eye />}>
                      View Details
                    </Button>
                  </Link>
                  
                  {isAdmin() && defect.status === 'open' && !defect.assignedTo && (
                    <Button
                      size="sm"
                      onClick={() => handleAssignDefectToStaff(defect)}
                      leftIcon={<Wrench />}
                      title="Assign defect to maintenance staff"
                    >
                      Assign Task
                    </Button>
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
            </Card.Body>
          </Card>
        ))}

        {displayDefects.length === 0 && (
          <EmptyState
            icon={<AlertTriangle />}
            title="No defects found"
            message="No defects match your current filters or no defects have been detected yet."
          >
            {isAdmin() && (
              <Link to="/inspections">
                <Button leftIcon={<AlertTriangle />}>
                  View Inspections
                </Button>
              </Link>
            )}
          </EmptyState>
        )}
        </div>
      )}
      
      {/* Create Task from Defect Modal */}
      <Modal
        isOpen={showAssignModal && selectedDefect}
        onClose={() => {
          setShowAssignModal(false)
          setSelectedDefect(null)
          setSelectedStaff('')
        }}
        title="Create Maintenance Task from Defect"
        size="md"
      >
        <Modal.Body>
          {selectedDefect && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Defect: <span className="font-medium">{selectedDefect.defectId}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Type: <span className="font-medium">{selectedDefect.defectType.replace('_', ' ')}</span> | 
                  Severity: <span className="font-medium">{selectedDefect.severity}</span>
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-4">
                  ℹ️ A new maintenance task will be created and assigned to the selected staff member.
                </p>
              </div>
              
              <Select
                label="Assign to Maintenance Staff *"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                options={[
                  { value: '', label: 'Select staff member...' },
                  ...maintenanceStaff.map(staff => ({
                    value: staff._id,
                    label: `${staff.firstName} ${staff.lastName} - ${staff.email}`
                  }))
                ]}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowAssignModal(false)
              setSelectedDefect(null)
              setSelectedStaff('')
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAssignment}
            disabled={!selectedStaff}
          >
            Create Task
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default Defects
