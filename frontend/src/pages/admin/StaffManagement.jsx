import React, { useState, useEffect } from 'react'
import { Users, Search, Filter, Edit, Trash2, UserPlus, Mail, Phone, Calendar, Shield } from 'lucide-react'
import apiClient from '../../api/apiClient.js'

const StaffManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.users.list({ limit: 100 })
      // Handle the nested data structure
      const usersData = response?.data?.users || response?.users || []
      setUsers(usersData)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError('Failed to load users. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesRole = filterRole === 'all' || user.role === filterRole

    return matchesSearch && matchesRole
  })

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'maintenance_staff':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  const getStatusBadgeColor = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Staff Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage system users and their roles
          </p>
        </div>
        <button className="btn-primary inline-flex items-center">
          <UserPlus className="h-4 w-4 mr-2" />
          Add New User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="input-field pl-10"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="maintenance_staff">Maintenance Staff</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users List */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || filterRole !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users have been added yet'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.map((user) => (
            <div key={user._id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Avatar */}
                    <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role === 'maintenance_staff' ? 'Maintenance Staff' : 'Admin'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(user.isActive)}`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Shield className="h-4 w-4 mr-2" />
                          <span className="font-medium mr-1">Username:</span>
                          {user.username}
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 mr-2" />
                          <span className="font-medium mr-1">Email:</span>
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-2" />
                            <span className="font-medium mr-1">Phone:</span>
                            {user.phone}
                          </div>
                        )}
                        {user.department && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <Users className="h-4 w-4 mr-2" />
                            <span className="font-medium mr-1">Department:</span>
                            {user.department}
                          </div>
                        )}
                        {user.employeeId && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400">
                            <span className="font-medium mr-1">Employee ID:</span>
                            {user.employeeId}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium mr-1">Last Login:</span>
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      title="Edit User"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats Footer */}
      {!loading && filteredUsers.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {users.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {users.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admins</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {users.filter(u => u.role === 'maintenance_staff').length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Maintenance Staff</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {users.filter(u => u.isActive).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffManagement
