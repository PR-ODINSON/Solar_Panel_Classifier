import React from 'react'
import { getStatusColor, getPriorityColor, getSeverityColor, getVariantColor } from './utils/colors'

/**
 * Badge component for status, priority, severity indicators
 * Centralizes all color logic - replaces duplicate getStatusColor functions
 * 
 * @param {Object} props
 * @param {string} props.status - Status value (pending, assigned, in_progress, etc.)
 * @param {string} props.priority - Priority value (low, medium, high, critical)
 * @param {string} props.severity - Severity value (minor, moderate, severe, critical)
 * @param {string} props.variant - Explicit variant (default, primary, success, warning, danger, info)
 * @param {string} props.size - Size variant: xs, sm, md (default: sm)
 * @param {boolean} props.dot - Show dot indicator
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Badge content
 */
const Badge = ({ 
  status, 
  priority, 
  severity, 
  variant, 
  size = 'sm', 
  dot = false,
  className = '',
  children 
}) => {
  // Determine color based on props (priority: status > priority > severity > variant)
  let colorClasses = ''
  if (status) {
    colorClasses = getStatusColor(status)
  } else if (priority) {
    colorClasses = getPriorityColor(priority)
  } else if (severity) {
    colorClasses = getSeverityColor(severity)
  } else if (variant) {
    colorClasses = getVariantColor(variant)
  } else {
    colorClasses = getVariantColor('default')
  }

  // Size classes
  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm'
  }

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${colorClasses}
        ${className}
      `.trim()}
    >
      {dot && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-current"></span>
      )}
      {children}
    </span>
  )
}

export default Badge
