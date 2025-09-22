import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Calendar, MapPin, Camera, Download, Eye, FileText } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const Inspections = () => {
  const { isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('all')

  // Mock inspection data
  const inspections = [
    {
      id: 1,
      inspectionId: 'INS-2024-001',
      date: '2024-01-20T10:30:00Z',
      location: 'Solar Farm Section A',
      droneUsed: 'DJI Mavic 3 Enterprise',
      status: 'completed',
      defectsFound: 15,
      totalPanels: 120,
      efficiency: 94.2,
      inspector: 'John Smith',
      weather: 'Clear, 22°C',
      flightTime: '45 minutes'
    },
    {
      id: 2,
      inspectionId: 'INS-2024-002',
      date: '2024-01-19T09:15:00Z',
      location: 'Solar Farm Section B',
      droneUsed: 'DJI Phantom 4 RTK',
      status: 'completed',
      defectsFound: 8,
      totalPanels: 96,
      efficiency: 96.8,
      inspector: 'Jane Wilson',
      weather: 'Partly cloudy, 20°C',
      flightTime: '38 minutes'
    },
    {
      id: 3,
      inspectionId: 'INS-2024-003',
      date: '2024-01-18T14:20:00Z',
      location: 'Solar Farm Section C',
      droneUsed: 'DJI Matrice 300 RTK',
      status: 'processing',
      defectsFound: null,
      totalPanels: 144,
      efficiency: null,
      inspector: 'Mike Johnson',
      weather: 'Clear, 25°C',
      flightTime: '52 minutes'
    },
    {
      id: 4,
      inspectionId: 'INS-2024-004',
      date: '2024-01-17T11:45:00Z',
      location: 'Solar Farm Section D',
      droneUsed: 'DJI Mavic 3 Enterprise',
      status: 'completed',
      defectsFound: 23,
      totalPanels: 180,
      efficiency: 91.5,
      inspector: 'Sarah Davis',
      weather: 'Clear, 24°C',
      flightTime: '62 minutes'
    }
  ]

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.inspectionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspector.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || inspection.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
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
          <button className="btn-secondary inline-flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </button>
          {isAdmin() && (
            <Link to="/upload-infer" className="btn-primary inline-flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              New Inspection
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
            <div className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">
              {inspections.filter(i => i.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Processing</div>
          </div>
        </div>
        <div className="card">
          <div className="card-body text-center">
            <div className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {inspections.reduce((sum, i) => sum + (i.defectsFound || 0), 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Defects</div>
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
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
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

      {/* Inspections list */}
      <div className="space-y-4">
        {filteredInspections.map((inspection) => {
          const severity = getDefectSeverity(inspection.defectsFound, inspection.totalPanels)
          
          return (
            <div key={inspection.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                          {inspection.inspectionId}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(inspection.status)}`}>
                          {inspection.status.toUpperCase()}
                        </span>
                        {severity && (
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(severity)}`}>
                            {severity.toUpperCase()} RISK
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="font-medium">Date:</span>
                        <span className="ml-1">{new Date(inspection.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-1">{inspection.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        <span className="font-medium">Drone:</span>
                        <span className="ml-1">{inspection.droneUsed}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Inspector:</span>
                        <span className="ml-1">{inspection.inspector}</span>
                      </div>
                    </div>

                    {inspection.status === 'completed' && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {inspection.defectsFound}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Defects Found
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            {inspection.totalPanels}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Panels Inspected
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                            {inspection.efficiency}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Avg Efficiency
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                            {inspection.flightTime}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Flight Time
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Weather: {inspection.weather}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/inspections/${inspection.id}`}
                      className="btn-secondary text-sm inline-flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Link>
                    {inspection.status === 'completed' && (
                      <>
                        <button className="btn-secondary text-sm inline-flex items-center">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </button>
                        <button className="btn-secondary text-sm inline-flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Excel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredInspections.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No inspections found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No inspection reports match your current filters.
            </p>
            {isAdmin() && (
              <Link to="/upload-infer" className="btn-primary inline-flex items-center">
                <Camera className="h-4 w-4 mr-2" />
                Start New Inspection
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Inspections
