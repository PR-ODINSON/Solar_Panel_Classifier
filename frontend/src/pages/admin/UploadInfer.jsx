import React, { useState, useEffect } from 'react'
import { Upload, Camera, Play, Download, AlertTriangle, CheckCircle, Clock, ExternalLink, Wifi } from 'lucide-react'

const UploadInfer = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [inferenceResults, setInferenceResults] = useState(null)
  const [error, setError] = useState(null)
  const [backendStatus, setBackendStatus] = useState('checking') // 'checking', 'connected', 'disconnected'

  const API_BASE_URL = 'http://localhost:8000' // Backend server URL

  // Check backend health on component mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/health`)
        if (response.ok) {
          const data = await response.json()
          setBackendStatus('connected')
          console.log('Backend health check:', data)
        } else {
          setBackendStatus('disconnected')
        }
      } catch (error) {
        setBackendStatus('disconnected')
        console.error('Backend health check failed:', error)
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
    setError(null)
    
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
      
    } catch (error) {
      console.error('Inference failed:', error)
      setError(error.message)
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
    
    results.forEach(result => {
      if (result.success && result.summary) {
        successfulFiles++
        totalPanels += result.summary.total_panels
        Object.keys(classDistribution).forEach(className => {
          classDistribution[className] += result.summary.class_distribution[className] || 0
        })
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
      results
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
      console.error('Download failed:', error)
      alert('Download failed. Please try again.')
    }
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
                          <span>Defects: {Object.values(file.result.summary?.class_distribution || {}).reduce((a, b) => a + b, 0) - (file.result.summary?.class_distribution?.Clean || 0)}</span>
                        </div>
                      )}
                      {file.result && !file.result.success && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Error: {file.result.error}
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
      {error && (
        <div className="card border-red-200 dark:border-red-800">
          <div className="card-body">
            <div className="flex items-center space-x-3 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <p className="font-medium">Processing Error</p>
                <p className="text-sm">{error}</p>
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
              <button className="btn-secondary text-sm inline-flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </button>
            </div>
          </div>
          <div className="card-body">
            {/* Summary stats */}
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

            {/* Defect breakdown */}
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

            {/* Download All Reports */}
            {inferenceResults.results && inferenceResults.results.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Download Reports
                </h4>
                <div className="flex flex-wrap gap-3">
                  {inferenceResults.results.filter(r => r.success).map((result, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{result.filename}:</span>
                      <button
                        onClick={() => handleDownload(result.annotated_image.replace('/outputs/', ''))}
                        className="btn-secondary text-sm inline-flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Image
                      </button>
                      <button
                        onClick={() => handleDownload(result.excel_report.replace('/outputs/', ''))}
                        className="btn-secondary text-sm inline-flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Excel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadInfer
