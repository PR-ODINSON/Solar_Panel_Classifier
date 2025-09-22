import React, { useState } from 'react'
import { Save, Edit, Camera, Key, Bell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

const Profile = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [isEditing, setIsEditing] = useState(false)
  
  const [profileData, setProfileData] = useState({
    personal: {
      fullName: user?.name || 'John Doe',
      email: user?.email || 'john.doe@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Maintenance',
      position: 'Senior Maintenance Technician',
      employeeId: 'EMP001',
      startDate: '2023-06-15',
      supervisor: 'Jane Smith'
    },
    contact: {
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      emergencyContact: 'Jane Doe',
      emergencyPhone: '+1 (555) 987-6543',
      emergencyRelation: 'Spouse'
    },
    preferences: {
      timezone: 'UTC-5',
      language: 'en',
      emailNotifications: true,
      smsNotifications: false,
      taskReminders: true,
      weeklyReports: true
    }
  })

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: Edit },
    { id: 'contact', name: 'Contact', icon: Bell },
    { id: 'security', name: 'Security', icon: Key }
  ]

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = () => {
    setIsEditing(false)
    alert('Profile updated successfully!')
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset data if needed
  }

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      {/* Profile picture section */}
      <div className="flex items-center space-x-6">
        <div className="relative">
          <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            <span className="text-2xl font-semibold text-primary-600 dark:text-primary-400">
              {profileData.personal.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          {isEditing && (
            <button className="absolute -bottom-2 -right-2 bg-primary-600 text-white rounded-full p-2 hover:bg-primary-700">
              <Camera className="h-4 w-4" />
            </button>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Profile Picture
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a professional photo for your profile
          </p>
        </div>
      </div>

      {/* Personal information form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            className="input-field"
            value={profileData.personal.fullName}
            onChange={(e) => handleInputChange('personal', 'fullName', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Employee ID
          </label>
          <input
            type="text"
            className="input-field"
            value={profileData.personal.employeeId}
            disabled={true}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="input-field"
            value={profileData.personal.email}
            onChange={(e) => handleInputChange('personal', 'email', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            className="input-field"
            value={profileData.personal.phone}
            onChange={(e) => handleInputChange('personal', 'phone', e.target.value)}
            disabled={!isEditing}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Department
          </label>
          <input
            type="text"
            className="input-field"
            value={profileData.personal.department}
            disabled={true}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Position
          </label>
          <input
            type="text"
            className="input-field"
            value={profileData.personal.position}
            disabled={true}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Start Date
          </label>
          <input
            type="date"
            className="input-field"
            value={profileData.personal.startDate}
            disabled={true}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Supervisor
          </label>
          <input
            type="text"
            className="input-field"
            value={profileData.personal.supervisor}
            disabled={true}
          />
        </div>
      </div>
    </div>
  )

  const renderContactInfo = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Address Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Street Address
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.contact.address}
              onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.contact.city}
              onChange={(e) => handleInputChange('contact', 'city', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.contact.state}
              onChange={(e) => handleInputChange('contact', 'state', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.contact.zipCode}
              onChange={(e) => handleInputChange('contact', 'zipCode', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Emergency Contact
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Name
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.contact.emergencyContact}
              onChange={(e) => handleInputChange('contact', 'emergencyContact', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              className="input-field"
              value={profileData.contact.emergencyPhone}
              onChange={(e) => handleInputChange('contact', 'emergencyPhone', e.target.value)}
              disabled={!isEditing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Relationship
            </label>
            <input
              type="text"
              className="input-field"
              value={profileData.contact.emergencyRelation}
              onChange={(e) => handleInputChange('contact', 'emergencyRelation', e.target.value)}
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Notification Preferences
        </h4>
        <div className="space-y-4">
          {Object.entries(profileData.preferences).slice(2).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value}
                  onChange={(e) => handleInputChange('preferences', key, e.target.checked)}
                  disabled={!isEditing}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Password & Security
        </h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter new password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="Confirm new password"
            />
          </div>
          <button className="btn-primary">
            Update Password
          </button>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Login Sessions
        </h4>
        <div className="space-y-3">
          {[
            { device: 'Windows PC', location: 'New York, NY', time: 'Current session', current: true },
            { device: 'iPhone 12', location: 'New York, NY', time: '2 hours ago', current: false },
            { device: 'Chrome Browser', location: 'New York, NY', time: '1 day ago', current: false }
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session.device}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.location} • {session.time}
                </p>
              </div>
              {!session.current && (
                <button className="text-sm text-red-600 hover:text-red-700">
                  Revoke
                </button>
              )}
              {session.current && (
                <span className="text-sm text-green-600">Current</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary inline-flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary inline-flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Profile navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Profile content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-body">
              {activeTab === 'personal' && renderPersonalInfo()}
              {activeTab === 'contact' && renderContactInfo()}
              {activeTab === 'security' && renderSecuritySettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
