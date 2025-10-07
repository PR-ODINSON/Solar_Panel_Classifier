import React, { useState, useEffect } from 'react'
import { Upload, Camera, Play, Download, AlertTriangle, CheckCircle, Clock, ExternalLink, Wifi, Save, FileText, Trash2 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../api/apiClient.js'
import { useToast } from '../../hooks/useToast.js'
import ToastContainer from '../../components/ToastContainer.jsx'

const UploadInfer = () => {
  const { user } = useAuth()
  const { toasts, removeToast, success, error, info, warning } = useToast()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [inferenceResults, setInferenceResults] = useState(null)
  const [errorState, setErrorState] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking', 'connected', 'disconnected'
  const [isSavingInspection, setIsSavingInspection] = useState(false)
  const [savedInspection, setSavedInspection] = useState(null)
  
  // Inspection metadata
  const [inspectionMetadata, setInspectionMetadata] = useState({
    site: '',
    notes: ''
  })

  const API_BASE_URL = 'http://localhost:8000' // Backend server URL


  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`)
        if (response.ok) {
          setBackendStatus('connected')
        } else {
          setBackendStatus('disconnected')
        }
      } catch (error) {
        setBackendStatus('disconnected')
      }
    }
    
    checkBackendHealth()
  }, [])

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      status: 'uploaded'
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    if (imageFiles.length > 0) {
      const newFiles = imageFiles.map(file => ({
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        status: 'uploaded'
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleStartInference = async () => {
    if (uploadedFiles.length === 0) return
    
    setIsProcessing(true)
    setInferenceResults(null)
    setErrorState(null)
    
    // Update file statuses to processing
    setUploadedFiles(prev => prev.map(file => ({ ...file, status: 'processing' })))
    
    try {
      // Create FormData for multipart upload
      const formData = new FormData()
      uploadedFiles.forEach(fileObj => {
        formData.append('files', fileObj.file)
      })
      
      // Call backend API
      const response = await fetch(`${API_BASE_URL}/process-upload`, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Process results
      const processedResults = processBackendResults(data.results)
      setInferenceResults(processedResults)
      
      // Update file statuses based on results
      setUploadedFiles(prev => prev.map(fileObj => {
        const result = data.results.find(r => r.filename === fileObj.name)
        return {
          ...fileObj,
          status: result && result.success ? 'completed' : 'error',
          result: result
        }
      }))
      
    } catch (err) {
      setErrorState(err.message)
      error(`Processing failed: ${err.message}`)
      setUploadedFiles(prev => prev.map(file => ({ ...file, status: 'error' })))
    } finally {
      setIsProcessing(false)
    }
  }

  const processBackendResults = (results) => {
    let totalPanels = 0
    let classDistribution = {
      'Bird-drop': 0,
      'Clean': 0, 
      'Dusty': 0,
      'Physical-Damage': 0
    }
    let totalFiles = results.length
    let successfulFiles = 0
    
    results.forEach((result) => {
      if (result.success) {
        successfulFiles++
        // Handle cases where summary might be missing or empty
        if (result.summary && result.summary.total_panels !== undefined) {
          totalPanels += result.summary.total_panels || 0
          if (result.summary.class_distribution) {
            Object.keys(classDistribution).forEach(className => {
              classDistribution[className] += result.summary.class_distribution[className] || 0
            })
          }
        }
      }
    })
    
    return {
      totalPanels,
      totalDefects: classDistribution['Bird-drop'] + classDistribution['Dusty'] + classDistribution['Physical-Damage'],
      crackCount: classDistribution['Physical-Damage'],
      dustCount: classDistribution['Dusty'],
      birdDropCount: classDistribution['Bird-drop'],
      cleanCount: classDistribution['Clean'],
      totalFiles,
      successfulFiles,
      classDistribution,
      results,
      hasResults: totalPanels > 0 || successfulFiles > 0
    }
  }

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const handleDownload = async (filename) => {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${filename}`)
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
      alert('Download failed. Please try again.')
    }
  }

  const handleDownloadAllImages = async () => {
    const successfulResults = inferenceResults.results.filter(r => r.success)
    for (const result of successfulResults) {
      const filename = result.annotated_image.replace('/outputs/', '')
      await handleDownload(filename)
      // Add small delay between downloads to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const handleDownloadAllExcel = async () => {
    const successfulResults = inferenceResults.results.filter(r => r.success)
    for (const result of successfulResults) {
      const filename = result.excel_report.replace('/outputs/', '')
      await handleDownload(filename)
      // Add small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  // Calculate priority based on inference results
  const calculateInspectionPriority = (inferenceResults) => {
    if (!inferenceResults || !inferenceResults.hasResults) return 'medium'
    
    const totalPanels = inferenceResults.totalPanels
    const totalDefects = inferenceResults.totalDefects
    const criticalDefects = inferenceResults.crackCount // Physical damage is critical
    const highDefects = inferenceResults.dustCount // Dusty panels are high priority
    const lowDefects = inferenceResults.birdDropCount // Bird drops are low priority
    
    // Calculate defect percentage
    const defectPercentage = totalPanels > 0 ? (totalDefects / totalPanels) * 100 : 0
    
    // Calculate severity score based on defect types and percentages
    const criticalPercentage = totalPanels > 0 ? (criticalDefects / totalPanels) * 100 : 0
    const highPercentage = totalPanels > 0 ? (highDefects / totalPanels) * 100 : 0
    
    console.log(`🔍 Priority Calculation:`, {
      totalPanels,
      totalDefects,
      defectPercentage: defectPercentage.toFixed(1) + '%',
      criticalDefects,
      criticalPercentage: criticalPercentage.toFixed(1) + '%',
      highDefects,
      highPercentage: highPercentage.toFixed(1) + '%'
    })
    
    // Updated Priority thresholds - more realistic
    if (criticalPercentage > 10 || defectPercentage > 70) {
      return 'critical'
    } else if (criticalPercentage > 5 || defectPercentage > 50 || highPercentage > 30) {
      return 'critical' // Changed: high defect percentage should be critical
    } else if (criticalPercentage > 2 || defectPercentage > 25 || highPercentage > 15) {
      return 'high'
    } else if (defectPercentage > 10 || highPercentage > 5) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  // Calculate overall health score
  const calculateHealthScore = (inferenceResults) => {
    if (!inferenceResults || !inferenceResults.hasResults) return 85

    const totalPanels = inferenceResults.totalPanels
    const totalDefects = inferenceResults.totalDefects
    const criticalDefects = inferenceResults.crackCount
    const highDefects = inferenceResults.dustCount
    const lowDefects = inferenceResults.birdDropCount

    if (totalPanels === 0) return 85

    // Base score starts at 100
    let healthScore = 100

    // Calculate defect percentages
    const defectPercentage = (totalDefects / totalPanels) * 100
    const criticalPercentage = (criticalDefects / totalPanels) * 100
    const highPercentage = (highDefects / totalPanels) * 100
    const lowPercentage = (lowDefects / totalPanels) * 100

    // More realistic deduction system
    // Critical defects: -50 points per panel percentage
    // High defects: -30 points per panel percentage  
    // Low defects: -10 points per panel percentage
    const criticalImpact = criticalPercentage * 0.5 // 50% impact per % of critical defects
    const highImpact = highPercentage * 0.3 // 30% impact per % of high defects
    const lowImpact = lowPercentage * 0.1 // 10% impact per % of low defects

    healthScore -= (criticalImpact + highImpact + lowImpact)

    console.log(`💊 Health Score Calculation:`, {
      totalPanels,
      totalDefects,
      defectPercentage: defectPercentage.toFixed(1) + '%',
      criticalImpact: criticalImpact.toFixed(1),
      highImpact: highImpact.toFixed(1),
      lowImpact: lowImpact.toFixed(1),
      finalScore: Math.max(0, Math.min(100, Math.round(healthScore)))
    })

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, Math.round(healthScore)))
  }

  // Calculate overall rating based on health score
  const calculateOverallRating = (healthScore) => {
    if (healthScore >= 90) return 'excellent'
    if (healthScore >= 75) return 'good'
    if (healthScore >= 60) return 'fair'
    if (healthScore >= 40) return 'poor'
    return 'critical'
  }

  // Get next inspection days based on priority
  const getNextInspectionDays = (priority) => {
    const inspectionIntervals = {
      'critical': 30,  // 1 month for critical issues
      'high': 60,      // 2 months for high priority
      'medium': 90,    // 3 months for medium priority
      'low': 180       // 6 months for low priority
    }
    return inspectionIntervals[priority] || 90
  }

  // Save inspection report and create defects
  const handleSaveInspectionReport = async () => {
    if (!inferenceResults || !inferenceResults.hasResults) {
      warning('No inference results to save')
      return
    }

    setIsSavingInspection(true)
    setErrorState(null)

    try {
      // Calculate dynamic values based on inference results
      const calculatedHealthScore = calculateHealthScore(inferenceResults)
      const calculatedPriority = calculateInspectionPriority(inferenceResults)
      const calculatedRating = calculateOverallRating(calculatedHealthScore)
      
      // Calculate average confidence from results
      const avgConfidence = inferenceResults.results.reduce((sum, result) => {
        if (result.success && result.detailed_results) {
          const resultConfidence = result.detailed_results.reduce((rSum, panel) => rSum + (panel.confidence || 0), 0) / result.detailed_results.length
          return sum + resultConfidence
        }
        return sum
      }, 0) / inferenceResults.results.filter(r => r.success).length * 100

      // Create overall image analysis summary (not per tile)
      const imageAnalysis = {
        totalPanelsDetected: inferenceResults.totalPanels,
        totalDefectsFound: inferenceResults.totalDefects,
        cleanPanels: inferenceResults.cleanCount,
        defectBreakdown: {
          physicalDamage: inferenceResults.crackCount,
          soiling: inferenceResults.dustCount + inferenceResults.birdDropCount,
          dusty: inferenceResults.dustCount,
          birdDrops: inferenceResults.birdDropCount
        },
        overallDefectPercentage: inferenceResults.totalPanels > 0 ? 
          Math.round((inferenceResults.totalDefects / inferenceResults.totalPanels) * 100) : 0,
        criticalDefectPercentage: inferenceResults.totalPanels > 0 ? 
          Math.round((inferenceResults.crackCount / inferenceResults.totalPanels) * 100) : 0
      }

      // Extract GPS coordinates from the first successful result
      let gpsCoordinates = null
      const firstResult = inferenceResults.results.find(r => r.success)
      if (firstResult && (firstResult.gps_latitude || firstResult.gps_longitude)) {
        gpsCoordinates = {
          latitude: firstResult.gps_latitude,
          longitude: firstResult.gps_longitude
        }
      }

      // Create overall summary findings instead of individual panel findings
      const findings = []
      if (imageAnalysis.defectBreakdown.physicalDamage > 0) {
        findings.push({
          category: 'visual',
          description: `Physical damage detected on ${imageAnalysis.defectBreakdown.physicalDamage} panels (${Math.round((imageAnalysis.defectBreakdown.physicalDamage / imageAnalysis.totalPanelsDetected) * 100)}% of total panels)`,
          severity: 'high',
          recommendation: 'Immediate inspection and repair required for panels with physical damage to prevent further deterioration and safety hazards.',
          images: inferenceResults.results.filter(r => r.success).map(r => r.annotated_image)
        })
      }
      
      if (imageAnalysis.defectBreakdown.dusty > 0) {
        findings.push({
          category: 'visual',
          description: `Soiling detected on ${imageAnalysis.defectBreakdown.dusty} panels (${Math.round((imageAnalysis.defectBreakdown.dusty / imageAnalysis.totalPanelsDetected) * 100)}% of total panels)`,
          severity: 'medium',
          recommendation: 'Schedule cleaning maintenance to restore panel efficiency. Consider automated cleaning systems for recurring issues.',
          images: inferenceResults.results.filter(r => r.success).map(r => r.annotated_image)
        })
      }
      
      if (imageAnalysis.defectBreakdown.birdDrops > 0) {
        findings.push({
          category: 'visual',
          description: `Bird dropping contamination detected on ${imageAnalysis.defectBreakdown.birdDrops} panels (${Math.round((imageAnalysis.defectBreakdown.birdDrops / imageAnalysis.totalPanelsDetected) * 100)}% of total panels)`,
          severity: 'low',
          recommendation: 'Clean affected panels and install bird deterrent systems to prevent future occurrences.',
          images: inferenceResults.results.filter(r => r.success).map(r => r.annotated_image)
        })
      }

      // Create defects based on AI analysis results
      const detectedDefects = []
      
      // Physical damage defects (cracks)
      if (imageAnalysis.defectBreakdown.physicalDamage > 0) {
        detectedDefects.push({
          type: 'crack',
          count: imageAnalysis.defectBreakdown.physicalDamage,
          percentage: Math.round((imageAnalysis.defectBreakdown.physicalDamage / imageAnalysis.totalPanelsDetected) * 100),
          severity: 'high'
        })
      }
      
      // Dusty panels (soiling)
      if (imageAnalysis.defectBreakdown.dusty > 0) {
        detectedDefects.push({
          type: 'soiling',
          count: imageAnalysis.defectBreakdown.dusty,
          percentage: Math.round((imageAnalysis.defectBreakdown.dusty / imageAnalysis.totalPanelsDetected) * 100),
          severity: 'medium'
        })
      }
      
      // Bird drop contamination (mapped to 'other' since bird_drop is not in enum)
      if (imageAnalysis.defectBreakdown.birdDrops > 0) {
        detectedDefects.push({
          type: 'other',
          count: imageAnalysis.defectBreakdown.birdDrops,
          percentage: Math.round((imageAnalysis.defectBreakdown.birdDrops / imageAnalysis.totalPanelsDetected) * 100),
          severity: 'low'
        })
      }

      // Create inspection report
      const inspectionData = {
        inspectionType: 'routine', // Default for AI-based inspections
        priority: calculatedPriority, // Auto-calculated based on defect analysis
        status: 'completed',
        // Add GPS coordinates if available
        ...(gpsCoordinates && {
          location: {
            site: inspectionMetadata.site,
            coordinates: {
              latitude: gpsCoordinates.latitude,
              longitude: gpsCoordinates.longitude
            },
            address: `GPS: ${gpsCoordinates.latitude?.toFixed(6)}, ${gpsCoordinates.longitude?.toFixed(6)}`
          }
        }),
        aiAnalysis: {
          conducted: true,
          confidence: Math.round(avgConfidence) || 85,
          detectedDefects: detectedDefects, // Now contains overall summary, not individual panels
          processedImageUrl: inferenceResults.results[0]?.annotated_image,
          rawImageUrl: `/uploads/${uploadedFiles[0]?.name}`,
          algorithm: 'YOLO + ResNet-50',
          modelVersion: 'v2.1',
          analysisDate: new Date(),
          totalPanelsAnalyzed: imageAnalysis.totalPanelsDetected,
          imageAnalysisSummary: imageAnalysis, // Overall image analysis
          defectsSummary: {
            total: imageAnalysis.totalDefectsFound,
            critical: imageAnalysis.defectBreakdown.physicalDamage,
            high: imageAnalysis.defectBreakdown.dusty,
            low: imageAnalysis.defectBreakdown.birdDrops,
            clean: imageAnalysis.cleanPanels,
            overallDefectPercentage: imageAnalysis.overallDefectPercentage,
            criticalDefectPercentage: imageAnalysis.criticalDefectPercentage
          }
        },
        findings: findings, // Now contains overall summary findings
        overallRating: calculatedRating, // Auto-calculated based on health score
        healthScore: calculatedHealthScore, // Auto-calculated based on defect analysis
        nextInspectionDate: new Date(Date.now() + getNextInspectionDays(calculatedPriority) * 24 * 60 * 60 * 1000),
        notes: inspectionMetadata.notes,
        images: inferenceResults.results.filter(r => r.success).map(r => r.annotated_image)
      }

      // Save inspection
      const inspectionResponse = await api.inspections.create(inspectionData)
      
      if (!inspectionResponse.success) {
        throw new Error('Failed to save inspection report')
      }

      const inspection = inspectionResponse.data.inspection
      setSavedInspection(inspection)

      // Create overall defects (not individual panel defects)
      const defectsCreated = []

      // Create defects based on overall analysis
      for (const defectSummary of detectedDefects) {
        if (defectSummary.count > 0) {
          const defectData = {
            inspection: inspection._id,
            defectType: defectSummary.type,
            severity: defectSummary.severity,
            priority: defectSummary.severity === 'high' ? 'high' : defectSummary.severity === 'medium' ? 'medium' : 'low',
            status: 'open',
            location: {
              description: `${inspectionMetadata.site || 'Unknown Site'} - Overall Image Analysis`,
              ...(gpsCoordinates && {
                gpsCoordinates: {
                  latitude: gpsCoordinates.latitude,
                  longitude: gpsCoordinates.longitude
                }
              })
            },
            description: `${defectSummary.type} detected on ${defectSummary.count} panels (${defectSummary.percentage}% of total panels) via AI analysis`,
            detectionMethod: 'ai_analysis',
            aiAnalysis: {
              confidence: Math.round(avgConfidence) || 85,
              algorithm: 'YOLO + ResNet-50',
              modelVersion: 'v2.1',
              processedImageUrl: inferenceResults.results[0]?.annotated_image,
              affectedPanelCount: defectSummary.count,
              affectedPanelPercentage: defectSummary.percentage
            },
            images: [{
              url: inferenceResults.results[0]?.annotated_image,
              type: 'processed',
              description: `AI-annotated image showing ${defectSummary.type} defects`,
              capturedDate: new Date()
            }],
            impact: {
              affectedPanels: defectSummary.count,
              affectedPercentage: defectSummary.percentage
            }
          }

          try {
            const defectResponse = await api.defects.create(defectData)
            if (defectResponse.success) {
              defectsCreated.push(defectResponse.data.defect)
            }
          } catch (defectError) {
            console.error('Error creating defect:', defectError)
          }
        }
      }

      success(`Inspection report saved successfully! Created ${defectsCreated.length} defect records.`)
      
    } catch (err) {
      console.error('Error saving inspection:', err)
      setErrorState(`Failed to save inspection report: ${err.message}`)
      error(`Failed to save inspection report: ${err.message}`)
    } finally {
      setIsSavingInspection(false)
    }
  }

  // Helper functions for mapping AI classifications to defect properties
  const mapClassificationToDefectType = (classification) => {
    const mapping = {
      'Physical-Damage': 'crack',      // Physical damage maps to crack
      'Dusty': 'soiling',              // Dusty panels map to soiling
      'Bird-drop': 'soiling'           // Bird drops also map to soiling
    }
    return mapping[classification] || 'other'
  }

  const mapClassificationToSeverity = (classification) => {
    const mapping = {
      'Physical-Damage': 'high',
      'Dusty': 'medium',
      'Bird-drop': 'low'
    }
    return mapping[classification] || 'medium'
  }

  const mapClassificationToPriority = (classification) => {
    const mapping = {
      'Physical-Damage': 'high',
      'Dusty': 'medium',
      'Bird-drop': 'low'
    }
    return mapping[classification] || 'medium'
  }

  // Power loss and cost estimation functions removed as we don't calculate these values

  // Get recommendation for defect type
  const getRecommendationForDefect = (classification) => {
    const recommendations = {
      'Physical-Damage': 'Immediate repair or replacement required. Inspect for structural integrity and safety hazards.',
      'Dusty': 'Schedule cleaning maintenance. Consider automated cleaning systems for recurring issues.',
      'Bird-drop': 'Clean affected panels and install bird deterrent systems to prevent future occurrences.'
    }
    return recommendations[classification] || 'Investigate further and take appropriate corrective action.'
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Upload & Infer Images
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Upload drone images and trigger AI inference for defect detection
          </p>
          <div className="flex items-center mt-2">
            <Wifi className={`h-4 w-4 mr-2 ${
              backendStatus === 'connected' ? 'text-green-600' :
              backendStatus === 'disconnected' ? 'text-red-600' :
              'text-yellow-600'
            }`} />
            <span className={`text-sm ${
              backendStatus === 'connected' ? 'text-green-600' :
              backendStatus === 'disconnected' ? 'text-red-600' :
              'text-yellow-600'
            }`}>
              Backend: {backendStatus === 'connected' ? 'Connected' : 
                      backendStatus === 'disconnected' ? 'Disconnected' : 'Checking...'}
            </span>
          </div>
        </div>
        <button
          onClick={handleStartInference}
          disabled={uploadedFiles.length === 0 || isProcessing || backendStatus !== 'connected'}
          className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="h-4 w-4 mr-2" />
          {isProcessing ? 'Processing...' : 'Start Inference'}
        </button>
      </div>

      {/* Inspection Metadata Form */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Inspection Details
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Location *
              </label>
              <input
                type="text"
                placeholder="e.g., Solar Farm A, Building 1"
                className="input-field"
                value={inspectionMetadata.site}
                onChange={(e) => setInspectionMetadata(prev => ({ ...prev, site: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Inspection Notes
              </label>
              <textarea
                placeholder="Additional notes about the inspection..."
                className="input-field h-20 resize-none"
                value={inspectionMetadata.notes}
                onChange={(e) => setInspectionMetadata(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
          </div>
          
        </div>
      </div>

      {/* Upload area */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Upload Drone Images
          </h3>
        </div>
        <div className="card-body">
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Drop your images here, or click to browse
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports JPG, PNG, and other image formats. Maximum 50MB per file.
                </p>
              </div>
              <div>
                <label className="btn-primary cursor-pointer inline-flex items-center">
                  <Camera className="h-4 w-4 mr-2" />
                  Choose Files
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Uploaded Files ({uploadedFiles.length})
              </h3>
              <button
                onClick={() => setUploadedFiles([])}
                className="btn-secondary text-sm"
                disabled={isProcessing}
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {file.status}
                      </p>
                      {file.result && file.result.success && (
                        <div className="mt-1 flex items-center space-x-3 text-xs text-gray-600 dark:text-gray-300">
                          <span>Panels: {file.result.summary?.total_panels || 0}</span>
                          <span>Defects: {file.result.summary?.class_distribution ? 
                            Object.values(file.result.summary.class_distribution).reduce((a, b) => a + b, 0) - (file.result.summary.class_distribution?.Clean || 0)
                            : 0}</span>
                          {(!file.result.summary || file.result.summary.total_panels === 0) && (
                            <span className="text-yellow-600 dark:text-yellow-400">No panels detected</span>
                          )}
                        </div>
                      )}
                      {file.result && !file.result.success && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {file.result.error || 'Processing failed'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {file.result && file.result.success && (
                      <>
                        <button
                          onClick={() => handleDownload(file.result.annotated_image.replace('/outputs/', ''))}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                          title="Download Annotated Image"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownload(file.result.excel_report.replace('/outputs/', ''))}
                          className="text-green-600 hover:text-green-800 text-sm"
                          title="Download Excel Report"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={isProcessing}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorState && (
        <div className="card border-red-200 dark:border-red-800">
          <div className="card-body">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <p className="font-medium">Processing Error</p>
                <p className="text-sm">{errorState}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Processing status */}
      {isProcessing && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-center space-x-3 py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  Processing Images...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI is analyzing your images for defects using YOLO detection and ResNet classification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inference results */}
      {inferenceResults && (
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Inference Results
              </h3>
              {inferenceResults.hasResults && (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {inferenceResults.successfulFiles} of {inferenceResults.totalFiles} files processed
                </span>
              )}
            </div>
          </div>
          <div className="card-body">
            {/* No panels detected message */}
            {!inferenceResults.hasResults && inferenceResults.successfulFiles > 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Solar Panels Detected
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Processing completed successfully, but no solar panels were found in the uploaded images.
                </p>
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg max-w-md mx-auto">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-2">
                    Common reasons:
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 text-left">
                    <li>• Images don't contain visible solar panels</li>
                    <li>• Poor image quality or lighting conditions</li>
                    <li>• Detection confidence thresholds are too strict</li>
                    <li>• Images need to be preprocessed or cropped</li>
                  </ul>
                </div>
                <div className="mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Files processed:</strong> {inferenceResults.successfulFiles} of {inferenceResults.totalFiles}
                  </p>
                </div>
              </div>
            )}
            
            {/* Processing failed for all files */}
            {inferenceResults.successfulFiles === 0 && inferenceResults.totalFiles > 0 && (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Processing Failed
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  All uploaded files failed to process. Please check the file formats and try again.
                </p>
                <div className="mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Files failed:</strong> {inferenceResults.totalFiles} of {inferenceResults.totalFiles}
                  </p>
                </div>
              </div>
            )}
            
            {/* Summary stats - only show when there are results */}
            {inferenceResults.hasResults && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {inferenceResults.totalPanels}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Panels Detected
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {inferenceResults.totalDefects}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Total Defects Found
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {inferenceResults.cleanCount}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Clean Panels
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {inferenceResults.successfulFiles}/{inferenceResults.totalFiles}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Files Processed
                    </div>
                  </div>
                </div>

                {/* AI Analysis Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-lg mb-6">
                  <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
                    🤖 AI Analysis Summary
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${
                        calculateHealthScore(inferenceResults) >= 80 ? 'text-green-600' :
                        calculateHealthScore(inferenceResults) >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {calculateHealthScore(inferenceResults)}%
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Health Score</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {calculateOverallRating(calculateHealthScore(inferenceResults)).toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-2 px-3 py-1 rounded-full inline-block ${
                        calculateInspectionPriority(inferenceResults) === 'critical' ? 'bg-red-100 text-red-800' :
                        calculateInspectionPriority(inferenceResults) === 'high' ? 'bg-orange-100 text-orange-800' :
                        calculateInspectionPriority(inferenceResults) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {calculateInspectionPriority(inferenceResults).toUpperCase()}
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority Level</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Auto-calculated
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {getNextInspectionDays(calculateInspectionPriority(inferenceResults))} days
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Next Inspection</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Based on priority
                      </div>
                    </div>
                  </div>
                  
                    <div className="mt-4 text-xs text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-800 p-3 rounded">
                      <strong>Analysis Logic:</strong> Priority is calculated based on defect percentage and severity. 
                      Critical defects (cracks) &gt;5% or total defects &gt;30% = Critical priority. 
                      Health score considers defect impact: Critical defects (-40pts), High defects (-20pts), Others (-10pts).
                      <br /><br />
                      <strong>AI Classification Mapping:</strong> Physical-Damage → crack, Dusty → soiling, Bird-drop → soiling
                      <br /><br />
                      <strong>Analysis Approach:</strong> Overall image analysis with tiling for detection, summary-level reporting (not per-tile)
                    </div>

                    {/* GPS Information */}
                    {inferenceResults.results && inferenceResults.results.length > 0 && (
                      <div className="mt-4 bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                        <h5 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2">📍 Location Information</h5>
                        {(() => {
                          const firstResult = inferenceResults.results.find(r => r.success)
                          if (firstResult && (firstResult.gps_latitude || firstResult.gps_longitude)) {
                            return (
                              <div className="text-xs text-green-700 dark:text-green-300">
                                <strong>GPS Coordinates:</strong> {firstResult.gps_latitude?.toFixed(6)}, {firstResult.gps_longitude?.toFixed(6)}
                                <br />
                                <strong>Site:</strong> {inspectionMetadata.site || 'Not specified'}
                              </div>
                            )
                          } else {
                            return (
                              <div className="text-xs text-green-700 dark:text-green-300">
                                <strong>GPS:</strong> No GPS data available in image
                                <br />
                                <strong>Site:</strong> {inspectionMetadata.site || 'Not specified'}
                              </div>
                            )
                          }
                        })()}
                      </div>
                    )}
                </div>
              </>
            )}

            {/* Defect breakdown - only show when there are results */}
            {inferenceResults.hasResults && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Defect Classification
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Physical Damage
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {inferenceResults.crackCount}
                      </p>
                    </div>
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Dusty Panels
                      </p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {inferenceResults.dustCount}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Bird Drops
                      </p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {inferenceResults.birdDropCount}
                      </p>
                    </div>
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Clean Panels
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {inferenceResults.cleanCount}
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Save Inspection Report */}
            {inferenceResults.hasResults && !savedInspection && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                        Save Inspection Report
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Save this analysis as an inspection report and automatically create defect records for maintenance tasks.
                      </p>
                    </div>
                    <button
                      onClick={handleSaveInspectionReport}
                      disabled={isSavingInspection || !inspectionMetadata.site}
                      className="btn-primary inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className={`h-4 w-4 mr-2 ${isSavingInspection ? 'animate-spin' : ''}`} />
                      {isSavingInspection ? 'Saving...' : 'Save Inspection'}
                    </button>
                  </div>
                  {!inspectionMetadata.site && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Please enter a site location above to save the inspection report.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Saved Inspection Success */}
            {savedInspection && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                      <div>
                        <h4 className="text-lg font-medium text-green-900 dark:text-green-100">
                          Inspection Report Saved Successfully!
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Inspection ID: {savedInspection.inspectionId} | Health Score: {savedInspection.healthScore}%
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this inspection report? This action cannot be undone.')) {
                          try {
                            await api.inspections.delete(savedInspection._id)
                            setSavedInspection(null)
                            alert('Inspection report deleted successfully')
                          } catch (err) {
                            console.error('Error deleting inspection:', err)
                            alert('Failed to delete inspection report')
                          }
                        }
                      }}
                      className="btn-danger text-sm inline-flex items-center"
                      title="Delete inspection report"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                  <div className="flex items-center space-x-4 mt-3">
                    <a
                      href="/inspections"
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 inline-flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      View in Inspection Reports
                    </a>
                    <a
                      href="/defects"
                      className="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 inline-flex items-center"
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Manage Defects
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Download All Reports */}
            {inferenceResults.results && inferenceResults.results.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                    Download Reports
                  </h4>
                  {inferenceResults.results.filter(r => r.success).length > 1 && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleDownloadAllImages}
                        className="btn-primary text-sm inline-flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        All Images
                      </button>
                      <button
                        onClick={handleDownloadAllExcel}
                        className="btn-primary text-sm inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        All Excel
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inferenceResults.results.filter(r => r.success).map((result, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2 truncate">
                        {result.filename}
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <div>Panels: {result.summary?.total_panels || 0}</div>
                        <div>Defects: {Object.values(result.summary?.class_distribution || {}).reduce((a, b) => a + b, 0) - (result.summary?.class_distribution?.Clean || 0)}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(result.annotated_image.replace('/outputs/', ''))}
                          className="flex-1 btn-secondary text-xs inline-flex items-center justify-center"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Image
                        </button>
                        <button
                          onClick={() => handleDownload(result.excel_report.replace('/outputs/', ''))}
                          className="flex-1 btn-secondary text-xs inline-flex items-center justify-center"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Excel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  )
}

export default UploadInfer
