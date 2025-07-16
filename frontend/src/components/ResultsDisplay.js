import React, { useState } from 'react';

const ResultsDisplay = ({ results }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!results || !results.results || results.results.length === 0) {
    return null;
  }

  const successfulResults = results.results.filter(result => result.success);
  const failedResults = results.results.filter(result => !result.success);

  const handleDownload = (filePath, filename) => {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getClassificationColor = (classification) => {
    switch (classification) {
      case 'Clean':
        return 'bg-green-100 text-green-800';
      case 'Dusty':
        return 'bg-yellow-100 text-yellow-800';
      case 'Bird-drop':
        return 'bg-orange-100 text-orange-800';
      case 'Physical-Damage':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Results */}
      {successfulResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Processing Results ({successfulResults.length} image{successfulResults.length !== 1 ? 's' : ''})
            </h3>
            <div className="flex items-center text-sm text-green-600">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Success
            </div>
          </div>

          {/* Image Navigation */}
          {successfulResults.length > 1 && (
            <div className="mb-4">
              <div className="flex space-x-2 overflow-x-auto">
                {successfulResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`px-3 py-2 text-sm rounded-md whitespace-nowrap ${
                      selectedImageIndex === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {result.filename}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selected Image Results */}
          {successfulResults[selectedImageIndex] && (
            <div className="space-y-4">
              <div className="selected-result">
                <h4 className="font-medium text-gray-900 mb-2">
                  {successfulResults[selectedImageIndex].filename}
                </h4>

                {/* GPS Coordinates */}
                {(successfulResults[selectedImageIndex].gps_latitude !== undefined && successfulResults[selectedImageIndex].gps_latitude !== null) && (
                  <div className="mb-2 text-sm text-gray-700">
                    <span className="font-medium">Latitude:</span> {successfulResults[selectedImageIndex].gps_latitude} <br />
                    <span className="font-medium">Longitude:</span> {successfulResults[selectedImageIndex].gps_longitude}
                  </div>
                )}

                {/* Annotated Image */}
                <div className="mb-4">
                  <img
                    src={successfulResults[selectedImageIndex].annotated_image}
                    alt="Annotated"
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '400px' }}
                  />
                </div>

                {/* Summary Statistics */}
                {successfulResults[selectedImageIndex].summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {successfulResults[selectedImageIndex].summary.total_panels}
                      </div>
                      <div className="text-sm text-gray-600">Total Panels</div>
                    </div>
                    
                    {Object.entries(successfulResults[selectedImageIndex].summary.class_distribution).map(([className, count]) => (
                      <div key={className} className="bg-gray-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-gray-900">{count}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getClassificationColor(className)}`}>
                          {className}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Download Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDownload(
                      successfulResults[selectedImageIndex].annotated_image,
                      `${successfulResults[selectedImageIndex].filename.split('.')[0]}_annotated.jpg`
                    )}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download Image
                  </button>
                  
                  <button
                    onClick={() => handleDownload(
                      successfulResults[selectedImageIndex].excel_report,
                      `${successfulResults[selectedImageIndex].filename.split('.')[0]}_report.xlsx`
                    )}
                    className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Excel Report
                  </button>
                </div>

                {/* Detailed Results Preview */}
                {successfulResults[selectedImageIndex].detailed_results && 
                 successfulResults[selectedImageIndex].detailed_results.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Detected Panels ({successfulResults[selectedImageIndex].detailed_results.length})
                    </h5>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {successfulResults[selectedImageIndex].detailed_results.slice(0, 10).map((panel, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{panel.panel_id}</span>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getClassificationColor(panel.classification)}`}>
                              {panel.classification}
                            </span>
                            <span className="text-gray-500">
                              {(panel.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {successfulResults[selectedImageIndex].detailed_results.length > 10 && (
                        <div className="text-xs text-gray-500 text-center">
                          ... and {successfulResults[selectedImageIndex].detailed_results.length - 10} more panels
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Failed Results */}
      {failedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">
              Failed Uploads ({failedResults.length})
            </h3>
          </div>
          
          <div className="space-y-2">
            {failedResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">{result.filename}</span>
                <span className="text-sm text-red-600">{result.error}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay; 