import React, { useState } from 'react'
import { Upload, Camera, Play, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react'

const UploadInfer = () => {
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [inferenceResults, setInferenceResults] = useState(null)

  // Mock inference results
  const mockResults = {
    totalDefects: 15,
    crackCount: 8,
    hotspotCount: 4,
    dustCount: 2,
    shadingCount: 1,
    processingTime: '2.3 seconds',
    confidence: 94.2
  }

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
    
    // Update file statuses to processing
    setUploadedFiles(prev => prev.map(file => ({ ...file, status: 'processing' })))
    
    // Mock processing delay
    setTimeout(() => {
      setUploadedFiles(prev => prev.map(file => ({ ...file, status: 'completed' })))
      setInferenceResults(mockResults)
      setIsProcessing(false)
    }, 3000)
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
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
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
        </div>
        <button
          onClick={handleStartInference}
          disabled={uploadedFiles.length === 0 || isProcessing}
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
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.size)} • {file.status}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                    disabled={isProcessing}
                  >
                    Remove
                  </button>
                </div>
              ))}
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
                  AI is analyzing your images for defects. This may take a few moments.
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
                  {inferenceResults.confidence}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Confidence Level
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {inferenceResults.processingTime}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Processing Time
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
                        Cracks
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
                        Hot Spots
                      </p>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {inferenceResults.hotspotCount}
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
                        Dust/Soiling
                      </p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {inferenceResults.dustCount}
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
                        Shading
                      </p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {inferenceResults.shadingCount}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UploadInfer
