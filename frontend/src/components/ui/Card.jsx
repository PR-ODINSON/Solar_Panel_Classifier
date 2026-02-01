import React from 'react'

/**
 * Card component - wraps existing .card utility classes
 * Provides semantic subcomponents for header, body, footer
 * 
 * @param {Object} props
 * @param {string} props.className - Additional CSS classes
 * @param {ReactNode} props.children - Card content
 * @param {Function} props.onClick - Click handler (makes card clickable)
 * @param {boolean} props.hoverable - Add hover effect (default: false)
 */
const Card = ({ 
  className = '', 
  children,
  onClick,
  hoverable = false,
  ...rest 
}) => {
  const isClickable = !!onClick

  return (
    <div
      onClick={onClick}
      className={`
        card
        ${isClickable || hoverable ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...rest}
    >
      {children}
    </div>
  )
}

// Subcomponents
Card.Header = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>
    {children}
  </div>
)

Card.Body = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>
    {children}
  </div>
)

Card.Footer = ({ children, className = '' }) => (
  <div className={`card-body border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)

export default Card
