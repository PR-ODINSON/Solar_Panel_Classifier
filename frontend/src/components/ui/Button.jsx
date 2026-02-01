import React from 'react'

/**
 * Button component with variants, sizes, icons, and loading states
 * Wraps existing btn-primary, btn-secondary utility classes
 * 
 * @param {Object} props
 * @param {string} props.variant - Button variant: primary, secondary, danger, success, outline, ghost
 * @param {string} props.size - Button size: xs, sm, md, lg (default: md)
 * @param {boolean} props.loading - Show loading spinner
 * @param {boolean} props.disabled - Disable button
 * @param {boolean} props.fullWidth - Full width button
 * @param {ReactNode} props.leftIcon - Icon to display on the left
 * @param {ReactNode} props.rightIcon - Icon to display on the right
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {Function} props.onClick - Click handler
 * @param {ReactNode} props.children - Button content
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  onClick,
  children,
  ...rest 
}) => {
  // Base variant classes (wrap existing utility classes)
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    outline: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
  }

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  // Icon size based on button size
  const iconSizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        ${variantClasses[variant]}
        ${!variantClasses[variant].includes('px-') ? sizeClasses[size] : ''}
        ${fullWidth ? 'w-full' : ''}
        inline-flex items-center justify-center
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...rest}
    >
      {loading && (
        <svg 
          className={`animate-spin ${iconSizeClasses[size]} ${leftIcon || children ? 'mr-2' : ''}`}
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {!loading && leftIcon && (
        <span className={`${iconSizeClasses[size]} ${children ? 'mr-2' : ''}`}>
          {leftIcon}
        </span>
      )}
      
      {children}
      
      {!loading && rightIcon && (
        <span className={`${iconSizeClasses[size]} ${children ? 'ml-2' : ''}`}>
          {rightIcon}
        </span>
      )}
    </button>
  )
}

export default Button
