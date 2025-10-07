import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from 'lucide-react'

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(onClose, 300) // Allow fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50/95 border-green-200 text-green-800 dark:bg-green-900/95 dark:border-green-700 dark:text-green-200'
      case 'error':
        return 'bg-red-50/95 border-red-200 text-red-800 dark:bg-red-900/95 dark:border-red-700 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-50/95 border-yellow-200 text-yellow-800 dark:bg-yellow-900/95 dark:border-yellow-700 dark:text-yellow-200'
      default:
        return 'bg-blue-50/95 border-blue-200 text-blue-800 dark:bg-blue-900/95 dark:border-blue-700 dark:text-blue-200'
    }
  }

  return (
    <div
      className={`max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`border rounded-lg shadow-lg p-4 backdrop-blur-sm ${getStyles()}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={() => {
                setIsVisible(false)
                setTimeout(onClose, 300)
              }}
              className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toast
