/**
 * UI Component Library - Barrel Export
 * Import all components from a single entry point
 * Usage: import { Button, Badge, Modal } from '@/components/ui'
 */

export { default as Button } from './Button'
export { default as Input } from './Input'
export { default as Select } from './Select'
export { default as Badge } from './Badge'
export { default as Modal } from './Modal'
export { default as Skeleton } from './Skeleton'
export { default as EmptyState } from './EmptyState'
export { default as Card } from './Card'

// Re-export color utilities
export { 
  getStatusColor, 
  getPriorityColor, 
  getSeverityColor,
  getVariantColor,
  statusColors,
  priorityColors,
  severityColors,
  variantColors
} from './utils/colors'
