import React from 'react'

/**
 * Input component with label, error states, helper text, and icons
 * Wraps existing input-field utility class
 * Supports both regular input and textarea via 'as' prop
 * 
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text, email, password, number, etc.)
 * @param {string} props.as - Render as 'input' or 'textarea' (default: input)
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message (shows error state)
 * @param {string} props.helperText - Helper text below input
 * @param {ReactNode} props.leftIcon - Icon on the left
 * @param {ReactNode} props.rightIcon - Icon on the right
 * @param {boolean} props.disabled - Disable input
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.rows - Rows for textarea (default: 4)
 */
const Input = React.forwardRef(({ 
  label,
  type = 'text',
  as = 'input',
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  className = '',
  rows = 4,
  ...rest 
}, ref) => {
  const Component = as
  const hasIcons = leftIcon || rightIcon

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <span className="h-5 w-5 inline-block">
              {leftIcon}
            </span>
          </div>
        )}
        
        <Component
          ref={ref}
          type={as === 'input' ? type : undefined}
          placeholder={placeholder}
          disabled={disabled}
          rows={as === 'textarea' ? rows : undefined}
          className={`
            input-field
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `.trim().replace(/\s+/g, ' ')}
          {...rest}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <span className="h-5 w-5 inline-block">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
