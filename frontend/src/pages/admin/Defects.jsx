import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, AlertTriangle, Thermometer, FileText, MapPin, Calendar, Eye, Wrench } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const Defects = () => {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock defect data
  const defects = [
    {
      id: 1,
      defectId: 'DEF-2024-001',
      type: 'crack',
      severity: 'high',
      status: 'pending',
      location: 'Panel A-15',
      coordinates: 'Row 3, Column 15',
      detectedDate: '2024-01-20T10:30:00Z',
      inspectionId: 'INS-2024-001',
      description: 'Significant crack detected across panel surface affecting cell performance',
      energyImpact: '12.5 kWh/day',
      priority: 'immediate',
      assignedTo: null,
      estimatedRepairTime: '2 hours',
      repairCost: '$450'
    },
    {
      id: 2,
      defectId: 'DEF-2024-002',
      type: 'hotspot',
      severity: 'medium',
      status: 'in_progress',
      location: 'Panel A-23',
      coordinates: 'Row 5, Column 23',
      detectedDate: '2024-01-20T10:30:00Z',
      inspectionId: 'INS-2024-001',
      description: 'Thermal anomaly detected in corner cell due to poor connection',
      energyImpact: '3.2 kWh/day',
      priority: 'high',
      assignedTo: 'John Smith',
      estimatedRepairTime: '1 hour',
      repairCost: '$180'
    },
    {
      id: 3,
      defectId: 'DEF-2024-003',
      type: 'dust',
      severity: 'low',
      status: 'completed',
      location: 'Panel A-45',
      coordinates: 'Row 8, Column 45',
      detectedDate: '2024-01-19T14:20:00Z',
      inspectionId: 'INS-2024-002',
      description: 'Heavy dust accumulation affecting light absorption',
      energyImpact: '1.8 kWh/day',
      priority: 'medium',
      assignedTo: 'Jane Wilson',
      estimatedRepairTime: '30 minutes',
      repairCost: '$50',
      completedDate: '2024-01-21T09:15:00Z'
    },
    {
      id: 4,
      defectId: 'DEF-2024-004',
      type: 'shading',
      severity: 'medium',
      status: 'scheduled',
      location: 'Panel B-12',
      coordinates: 'Row 2, Column 12',
      detectedDate: '2024-01-19T14:20:00Z',
      inspectionId: 'INS-2024-002',
      description: 'Permanent shading from nearby vegetation growth',
      energyImpact: '5.7 kWh/day',
      priority: 'high',
      assignedTo: 'Mike Johnson',
      estimatedRepairTime: '3 hours',
      repairCost: '$320',
      scheduledDate: '2024-01-25T08:00:00Z'
    },
    {
      id: 5,
      defectId: 'DEF-2024-005',
      type: 'pid',
      severity: 'high',
      status: 'pending',
      location: 'Panel C-08',
      coordinates: 'Row 1, Column 8',
      detectedDate: '2024-01-18T11:45:00Z',
      inspectionId: 'INS-2024-004',
      description: 'Potential Induced Degradation affecting multiple cells',
      energyImpact: '18.3 kWh/day',
      priority: 'immediate',
      assignedTo: null,
      estimatedRepairTime: '4 hours',
      repairCost: '$850'
    }
  ]

  const filteredDefects = defects.filter(defect => {
    const matchesSearch = defect.defectId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || defect.type === filterType
    const matchesSeverity = filterSeverity === 'all' || defect.severity === filterSeverity
    const matchesStatus = filterStatus === 'all' || defect.status === filterStatus
    return matchesSearch && matchesType && matchesSeverity && matchesStatus
  })

  const getDefectIcon = (type) => {
    switch (type) {
      case 'crack': return <AlertTriangle className="h-5 w-5" />
      case 'hotspot': return <Thermometer className="h-5 w-5" />
      case 'dust': return <FileText className="h-5 w-5" />
      case 'shading': return <FileText className="h-5 w-5" />
      case 'pid': return <AlertTriangle className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'crack': return 'text-red-600 bg-red-100'
      case 'hotspot': return 'text-orange-600 bg-orange-100'
      case 'dust': return 'text-yellow-600 bg-yellow-100'
      case 'shading': return 'text-purple-600 bg-purple-100'
      case 'pid': return 'text-pink-600 bg-pink-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-700 bg-red-200'
      case 'medium': return 'text-yellow-700 bg-yellow-200'
      case 'low': return 'text-green-700 bg-green-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-700 bg-gray-200'
      case 'in_progress': return 'text-blue-700 bg-blue-200'
      case 'scheduled': return 'text-purple-700 bg-purple-200'
      case 'completed': return 'text-green-700 bg-green-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'immediate': return 'border-l-4 border-red-500'
      case 'high': return 'border-l-4 border-orange-500'
      case 'medium': return 'border-l-4 border-yellow-500'
      case 'low': return 'border-l-4 border-green-500'
      default: return 'border-l-4 border-gray-500'
    }
  }

  const maintenanceStaff = [
    { id: 'john.smith', name: 'John Smith' },
    { id: 'jane.wilson', name: 'Jane Wilson' },
    { id: 'mike.johnson', name: 'Mike Johnson' },
    { id: 'sarah.davis', name: 'Sarah Davis' }
  ]

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
          {isAdmin() && (
            <button className="btn-secondary inline-flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Generate Heatmap
            </button>
          )}
          <Link to={isAdmin() ? "/inspections" : "/maintenance/inspections"} className="btn-primary inline-flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            View Inspections
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-gray-900 dark:text-white">
              {defects.length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Defects</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {defects.filter(d => d.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending</div>
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
            <div className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
              {defects.filter(d => d.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Scheduled</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {defects.filter(d => d.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Completed</div>
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
                <option value="dust">Dust/Soiling</option>
                <option value="shading">Shading</option>
                <option value="pid">PID</option>
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
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredDefects.length} of {defects.length} defects
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Defects list */}
      <div className="space-y-4">
        {filteredDefects.map((defect) => (
          <div key={defect.id} className={`card ${getPriorityColor(defect.priority)}`}>
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${getTypeColor(defect.type)}`}>
                    {getDefectIcon(defect.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {defect.defectId}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(defect.type)}`}>
                        {defect.type.toUpperCase()}
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
                        <span className="ml-1">{defect.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Detected:</span>
                        <span className="ml-1">{new Date(defect.detectedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Energy Impact:</span>
                        <span className="ml-1 text-orange-600 dark:text-orange-400">{defect.energyImpact}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Repair Cost:</span>
                        <span className="ml-1 text-green-600 dark:text-green-400">{defect.repairCost}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  {defect.assignedTo ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      Assigned to: {defect.assignedTo}
                    </span>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      Unassigned
                    </span>
                  )}
                  <span className="text-gray-500 dark:text-gray-400">
                    Est. Time: {defect.estimatedRepairTime}
                  </span>
                  {defect.scheduledDate && (
                    <span className="text-purple-600 dark:text-purple-400">
                      Scheduled: {new Date(defect.scheduledDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {isAdmin() && !defect.assignedTo && defect.status === 'pending' && (
                    <select className="text-sm border border-gray-300 dark:border-gray-600 rounded px-3 py-1">
                      <option value="">Assign to...</option>
                      {maintenanceStaff.map(staff => (
                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                      ))}
                    </select>
                  )}
                  
                  <Link
                    to={`/defects/${defect.id}`}
                    className="btn-secondary text-sm inline-flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                  
                  {defect.status !== 'completed' && (
                    <button className="btn-primary text-sm inline-flex items-center">
                      <Wrench className="h-4 w-4 mr-1" />
                      {isAdmin() ? 'Schedule Repair' : 'Update Status'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDefects.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No defects found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No defects match your current filters.
            </p>
            <Link to={isAdmin() ? "/inspections" : "/maintenance/inspections"} className="btn-primary inline-flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Inspections
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Defects
