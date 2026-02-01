import React from 'react'

/**
 * Select dropdown component with label and error states
 * Wraps existing input-field utility class for consistency
 * 
 * @param {Object} props
 * @param {string} props.label - Select label
 * @param {Array} props.options - Array of {value, label} objects
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder option text
 * @param {string} props.error - Error message
 * @param {boolean} props.disabled - Disable select
 * @param {boolean} props.required - Required field indicator
 * @param {string} props.className - Additional CSS classes
 */
const Select = ({ 
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  disabled = false,
  required = false,
  className = '',
  ...rest 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          input-field
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `.trim().replace(/\s+/g, ' ')}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default Select
