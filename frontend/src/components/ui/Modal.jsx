import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

/**
 * Modal component with backdrop, ESC key close, and basic focus trap
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Control modal visibility
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size: sm, md, lg, xl, full (default: md)
 * @param {boolean} props.closeOnBackdrop - Close on backdrop click (default: true)
 * @param {boolean} props.closeOnEsc - Close on ESC key (default: true)
 * @param {boolean} props.showCloseButton - Show close button (default: true)
 * @param {string} props.className - Additional CSS classes for modal content
 * @param {ReactNode} props.children - Modal content
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  size = 'md', 
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
  children 
}) => {
  const modalRef = useRef(null)

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl'
  }

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEsc, onClose])

  // Basic focus trap
  useEffect(() => {
    if (!isOpen) return

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (!focusableElements || focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTab = (e) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    document.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`
          bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full
          ${sizeClasses[size]}
          ${className}
          animate-slide-in
        `.trim().replace(/\s+/g, ' ')}
      >
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
        
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

// Subcomponents for cleaner API
Modal.Body = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
)

Modal.Footer = ({ children, className = '' }) => (
  <div className={`flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
)

export default Modal
