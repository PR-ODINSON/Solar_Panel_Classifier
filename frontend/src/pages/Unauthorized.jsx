import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui'

const Unauthorized = () => {
  const location = useLocation()
  const message = location.state?.message || 'You do not have permission to access this page.'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-24 w-24 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-full mb-6">
          <Shield className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Access Denied
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {message}
        </p>
        
        <div className="space-y-3">
          <Link to="/">
            <Button leftIcon={ArrowLeft} className="w-full">
              Return to Dashboard
            </Button>
          </Link>
          
          <Link to="/settings">
            <Button variant="secondary" className="w-full">
              Contact Administrator
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Unauthorized
