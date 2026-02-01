import React from 'react'

/**
 * EmptyState component for no data scenarios
 * 
 * @param {Object} props
 * @param {ReactNode} props.icon - Icon to display
 * @param {string} props.title - Title text
 * @param {string} props.message - Description message
 * @param {ReactNode} props.action - Optional action button
 * @param {string} props.className - Additional CSS classes
 */
const EmptyState = ({ 
  icon, 
  title = 'No data found', 
  message,
  action,
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 text-gray-400">
            {icon}
          </div>
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      {message && (
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {message}
        </p>
      )}
      
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  )
}

export default EmptyState
