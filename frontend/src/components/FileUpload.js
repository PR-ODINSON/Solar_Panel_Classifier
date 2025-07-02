import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ onFilesSelected, selectedFiles, disabled }) => {
  const onDrop = useCallback((acceptedFiles) => {
    // Filter to only allow image files
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && 
      (file.type.includes('jpeg') || file.type.includes('jpg') || file.type.includes('png'))
    );
    
    onFilesSelected(imageFiles);
  }, [onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    multiple: true,
    disabled
  });

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Images</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {/* Upload Icon */}
          <div className="mx-auto w-16 h-16 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 48 48" aria-hidden="true">
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          {/* Upload Text */}
          <div>
            {isDragActive ? (
              <p className="text-lg text-blue-600 font-medium">
                Drop the images here...
              </p>
            ) : (
              <div>
                <p className="text-lg text-gray-600">
                  <span className="font-medium text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, JPEG, PNG files (max 50MB each)
                </p>
              </div>
            )}
          </div>
          
          {/* File count indicator */}
          {selectedFiles.length > 0 && (
            <div className="text-sm text-green-600 font-medium">
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>
      </div>
      
      {/* File type info */}
      <div className="mt-4 text-xs text-gray-500">
        <p className="font-medium mb-1">Supported formats:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>JPEG/JPG - Drone images with solar panels</li>
          <li>PNG - High resolution aerial photographs</li>
          <li>Multiple files can be processed simultaneously</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload; 