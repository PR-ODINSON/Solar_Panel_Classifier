import React from 'react'

/**
 * Skeleton loader component for loading states
 * Provides better UX than spinners for content loading
 * 
 * @param {Object} props
 * @param {string} props.width - Width (default: 100%)
 * @param {string} props.height - Height (default: 1rem)
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Variant: text, circular, rectangular (default: rectangular)
 */
const Skeleton = ({ 
  width = '100%', 
  height = '1rem', 
  className = '',
  variant = 'rectangular'
}) => {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  return (
    <div
      className={`
        bg-gray-200 dark:bg-gray-700 animate-pulse
        ${variantClasses[variant]}
        ${className}
      `.trim()}
      style={{ width, height }}
    />
  )
}

// Preset skeleton patterns
Skeleton.Text = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height="0.75rem" 
        width={i === lines - 1 ? '80%' : '100%'}
        variant="text"
      />
    ))}
  </div>
)

Skeleton.Card = ({ className = '' }) => (
  <div className={`card ${className}`}>
    <div className="card-body space-y-4">
      <Skeleton height="1.5rem" width="60%" />
      <Skeleton.Text lines={3} />
      <div className="flex space-x-2">
        <Skeleton height="2rem" width="5rem" />
        <Skeleton height="2rem" width="5rem" />
      </div>
    </div>
  </div>
)

Skeleton.Avatar = ({ size = 'md' }) => {
  const sizeMap = {
    sm: '2rem',
    md: '3rem',
    lg: '4rem'
  }
  
  return (
    <Skeleton 
      width={sizeMap[size]} 
      height={sizeMap[size]} 
      variant="circular" 
    />
  )
}

Skeleton.Table = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`table-container ${className}`}>
    <table className="table">
      <thead className="table-header">
        <tr>
          {Array.from({ length: cols }).map((_, i) => (
            <th key={i} className="table-header-cell">
              <Skeleton height="1rem" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <td key={colIndex} className="table-cell">
                <Skeleton height="1rem" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default Skeleton
