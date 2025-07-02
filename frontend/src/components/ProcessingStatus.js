import React from 'react';

const ProcessingStatus = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="text-center">
        {/* Animated Loading Icon */}
        <div className="mx-auto w-16 h-16 mb-4">
          <svg className="animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Processing Images...
        </h3>
        
        <p className="text-gray-600 mb-6">
          This may take a few minutes depending on image size and quantity
        </p>
        
        {/* Processing Steps */}
        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 h-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
            <span className="text-sm text-gray-700">Tiling large images</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 h-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            <span className="text-sm text-gray-700">Detecting solar panels with YOLO</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 h-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            <span className="text-sm text-gray-700">Classifying panel conditions</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-6 h-6">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
            </div>
            <span className="text-sm text-gray-700">Generating reports</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingStatus; 