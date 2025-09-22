import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, MapPin, Calendar, Camera, Thermometer, AlertTriangle, CheckCircle, FileText } from 'lucide-react'

const InspectionDetail = () => {
  const { id } = useParams()
  
  // Mock detailed inspection data
  const inspection = {
    id: 1,
    inspectionId: 'INS-2024-001',
    date: '2024-01-20T10:30:00Z',
    location: 'Solar Farm Section A',
    coordinates: '40.7128° N, 74.0060° W',
    droneUsed: 'DJI Mavic 3 Enterprise',
    status: 'completed',
    inspector: 'John Smith',
    weather: {
      condition: 'Clear',
      temperature: '22°C',
      humidity: '45%',
      windSpeed: '8 km/h'
    },
    flightDetails: {
      duration: '45 minutes',
      altitude: '50-120m',
      coverage: '12.5 hectares',
      imagesCaptured: 847
    },
    summary: {
      totalPanels: 120,
      defectsFound: 15,
      efficiency: 94.2,
      energyLoss: '28.3 kWh',
      confidenceScore: 94.7
    },
    defects: [
      {
        id: 1,
        type: 'crack',
        severity: 'high',
        location: 'Panel A-15',
        coordinates: 'Row 3, Column 15',
        description: 'Significant crack detected across panel surface',
        energyImpact: '12.5 kWh loss',
        priority: 'immediate',
        status: 'pending'
      },
      {
        id: 2,
        type: 'hotspot',
        severity: 'medium',
        location: 'Panel A-23',
        coordinates: 'Row 5, Column 23',
        description: 'Thermal anomaly detected in corner cell',
        energyImpact: '3.2 kWh loss',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 3,
        type: 'dust',
        severity: 'low',
        location: 'Panel A-45',
        coordinates: 'Row 8, Column 45',
        description: 'Heavy dust accumulation affecting performance',
        energyImpact: '1.8 kWh loss',
        priority: 'medium',
        status: 'scheduled'
      }
    ]
  }

  const getDefectIcon = (type) => {
    switch (type) {
      case 'crack': return <AlertTriangle className="h-4 w-4" />
      case 'hotspot': return <Thermometer className="h-4 w-4" />
      case 'dust': return <FileText className="h-4 w-4" />
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
              {inspection.inspectionId}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed inspection report and defect analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary inline-flex items-center">
            <Download className="h-4 w-4 mr-2" />
            PDF Report
          </button>
          <button className="btn-secondary inline-flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Excel Export
          </button>
        </div>
      </div>

      {/* Inspection Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Inspection Information
            </h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Date & Time</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(inspection.date).toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.location}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{inspection.coordinates}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Camera className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Drone Used</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.droneUsed}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Inspector</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.inspector}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Weather & Flight Details */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Weather Conditions
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Condition</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.weather.condition}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Temperature</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.weather.temperature}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Humidity</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.weather.humidity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Wind Speed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.weather.windSpeed}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Flight Details
              </h3>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Duration</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.flightDetails.duration}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Altitude</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.flightDetails.altitude}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Coverage</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.flightDetails.coverage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Images</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{inspection.flightDetails.imagesCaptured}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Inspection Summary
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {inspection.summary.totalPanels}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Panels Inspected
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {inspection.summary.defectsFound}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Defects Found
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {inspection.summary.efficiency}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Avg Efficiency
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {inspection.summary.energyLoss}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Energy Loss
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {inspection.summary.confidenceScore}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                AI Confidence
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Defects */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Detected Defects ({inspection.defects.length})
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {inspection.defects.map((defect) => (
              <div key={defect.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getDefectColor(defect.severity)}`}>
                      {getDefectIcon(defect.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {defect.type.charAt(0).toUpperCase() + defect.type.slice(1)} - {defect.location}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {defect.coordinates}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDefectColor(defect.severity)}`}>
                      {defect.severity.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(defect.priority)}`}>
                      {defect.priority.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(defect.status)}`}>
                      {defect.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {defect.description}
                </p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    Impact: {defect.energyImpact}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/defects/${defect.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View Details
                    </Link>
                    <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                      Schedule Repair
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InspectionDetail
