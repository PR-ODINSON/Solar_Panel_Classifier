import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Calendar, AlertTriangle, Thermometer, FileText, Camera, Download, Wrench, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const DefectDetail = () => {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  
  // Mock detailed defect data
  const defect = {
    id: 1,
    defectId: 'DEF-2024-001',
    type: 'crack',
    severity: 'high',
    status: 'in_progress',
    location: 'Panel A-15',
    coordinates: 'Row 3, Column 15',
    detectedDate: '2024-01-20T10:30:00Z',
    inspectionId: 'INS-2024-001',
    description: 'Significant crack detected across panel surface affecting multiple cells. The crack extends diagonally across approximately 60% of the panel surface, causing substantial reduction in power output.',
    energyImpact: '12.5 kWh/day',
    priority: 'immediate',
    assignedTo: 'John Smith',
    estimatedRepairTime: '2 hours',
    repairCost: '$450',
    panelDetails: {
      manufacturer: 'SolarTech Pro',
      model: 'ST-320W',
      serialNumber: 'ST320-2023-A15',
      installationDate: '2023-03-15',
      warrantyStatus: 'Active',
      efficiency: 18.2,
      currentOutput: 156.8
    },
    aiAnalysis: {
      confidence: 94.7,
      detectionMethod: 'Visual + Thermal',
      algorithmVersion: 'ResNet-50 v2.1',
      processingTime: '1.3 seconds',
      imageResolution: '4096x4096'
    },
    history: [
      {
        id: 1,
        timestamp: '2024-01-20T10:30:00Z',
        action: 'Defect Detected',
        user: 'AI System',
        details: 'Crack detected during automated inspection'
      },
      {
        id: 2,
        timestamp: '2024-01-20T11:15:00Z',
        action: 'Priority Assessed',
        user: 'System Admin',
        details: 'Classified as high priority due to energy impact'
      },
      {
        id: 3,
        timestamp: '2024-01-20T14:30:00Z',
        action: 'Assigned',
        user: 'Maintenance Manager',
        details: 'Assigned to John Smith for repair'
      },
      {
        id: 4,
        timestamp: '2024-01-21T09:00:00Z',
        action: 'Repair Started',
        user: 'John Smith',
        details: 'Started panel inspection and repair process'
      }
    ],
    images: [
      {
        id: 1,
        type: 'original',
        url: '/api/images/defect-1-original.jpg',
        caption: 'Original drone capture showing crack'
      },
      {
        id: 2,
        type: 'annotated',
        url: '/api/images/defect-1-annotated.jpg',
        caption: 'AI-annotated image highlighting defect area'
      },
      {
        id: 3,
        type: 'thermal',
        url: '/api/images/defect-1-thermal.jpg',
        caption: 'Thermal image showing temperature anomaly'
      }
    ]
  }

  const getDefectIcon = (type) => {
    switch (type) {
      case 'crack': return <AlertTriangle className="h-5 w-5" />
      case 'hotspot': return <Thermometer className="h-5 w-5" />
      case 'dust': return <FileText className="h-5 w-5" />
      default: return <AlertTriangle className="h-5 w-5" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'crack': return 'text-red-600 bg-red-100'
      case 'hotspot': return 'text-orange-600 bg-orange-100'
      case 'dust': return 'text-yellow-600 bg-yellow-100'
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
      case 'completed': return 'text-green-700 bg-green-200'
      default: return 'text-gray-700 bg-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to={isAdmin() ? "/defects" : "/maintenance/defects"}
            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
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
          <button className="btn-secondary inline-flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          {isAdmin() && (
            <button className="btn-primary inline-flex items-center">
              <Wrench className="h-4 w-4 mr-2" />
              Schedule Repair
            </button>
          )}
        </div>
      </div>

      {/* Defect Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Defect Information
                </h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(defect.type)}`}>
                    {defect.type.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getSeverityColor(defect.severity)}`}>
                    {defect.severity.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(defect.status)}`}>
                    {defect.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className={`p-3 rounded-lg ${getTypeColor(defect.type)} mr-4 mt-1`}>
                    {getDefectIcon(defect.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      {defect.type.charAt(0).toUpperCase() + defect.type.slice(1)} Defect
                    </h4>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {defect.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Location:</span>
                        <span className="ml-1">{defect.location} ({defect.coordinates})</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="font-medium">Detected:</span>
                        <span className="ml-1">{new Date(defect.detectedDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Energy Impact:</span>
                        <span className="ml-1 text-orange-600 dark:text-orange-400">{defect.energyImpact}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Repair Cost:</span>
                        <span className="ml-1 text-green-600 dark:text-green-400">{defect.repairCost}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Assigned To:</span>
                        <span className="ml-1">{defect.assignedTo || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">Est. Repair Time:</span>
                        <span className="ml-1">{defect.estimatedRepairTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Panel Information
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Manufacturer:</span>
                  <p className="text-gray-900 dark:text-white">{defect.panelDetails.manufacturer}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                  <p className="text-gray-900 dark:text-white">{defect.panelDetails.model}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Serial Number:</span>
                  <p className="text-gray-900 dark:text-white">{defect.panelDetails.serialNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Installation Date:</span>
                  <p className="text-gray-900 dark:text-white">{new Date(defect.panelDetails.installationDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Warranty Status:</span>
                  <p className="text-green-600 dark:text-green-400">{defect.panelDetails.warrantyStatus}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Rated Efficiency:</span>
                  <p className="text-gray-900 dark:text-white">{defect.panelDetails.efficiency}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Current Output:</span>
                  <p className="text-yellow-600 dark:text-yellow-400">{defect.panelDetails.currentOutput}W</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Analysis & Images */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                AI Analysis
              </h3>
            </div>
            <div className="card-body">
              <div className="space-y-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Confidence Score:</span>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{defect.aiAnalysis.confidence}%</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Detection Method:</span>
                  <p className="text-gray-900 dark:text-white">{defect.aiAnalysis.detectionMethod}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Algorithm:</span>
                  <p className="text-gray-900 dark:text-white">{defect.aiAnalysis.algorithmVersion}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Processing Time:</span>
                  <p className="text-gray-900 dark:text-white">{defect.aiAnalysis.processingTime}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">Image Resolution:</span>
                  <p className="text-gray-900 dark:text-white">{defect.aiAnalysis.imageResolution}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Related Inspection
              </h3>
            </div>
            <div className="card-body">
              <Link 
                to={`/inspections/${defect.inspectionId.split('-')[2]}`}
                className="block p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{defect.inspectionId}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View full inspection report</p>
                  </div>
                  <div className="text-primary-600 dark:text-primary-400">→</div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Defect Images
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {defect.images.map((image) => (
              <div key={image.id} className="space-y-2">
                <div className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Camera className="h-12 w-12 text-gray-400" />
                  {/* Placeholder for image - in real implementation, you'd use an img tag */}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {image.type.charAt(0).toUpperCase() + image.type.slice(1)} Image
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {image.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Activity History
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {defect.history.map((entry) => (
              <div key={entry.id} className="flex items-start space-x-3">
                <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-full mt-1">
                  <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {entry.action}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {entry.details}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    by {entry.user}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DefectDetail
