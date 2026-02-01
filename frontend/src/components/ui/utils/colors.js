/**
 * Centralized color maps for badges and status indicators
 * Single source of truth for all status/priority/severity colors
 */

export const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  open: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  resolved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
}

export const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export const severityColors = {
  minor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  moderate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  severe: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export const variantColors = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
}

/**
 * Get color classes for a given status
 */
export const getStatusColor = (status) => {
  return statusColors[status] || statusColors.pending
}

/**
 * Get color classes for a given priority
 */
export const getPriorityColor = (priority) => {
  return priorityColors[priority] || priorityColors.medium
}

/**
 * Get color classes for a given severity
 */
export const getSeverityColor = (severity) => {
  return severityColors[severity] || severityColors.moderate
}

/**
 * Get color classes for a given variant
 */
export const getVariantColor = (variant) => {
  return variantColors[variant] || variantColors.default
}
