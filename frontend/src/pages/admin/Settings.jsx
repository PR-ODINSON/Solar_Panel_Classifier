import React, { useState } from 'react'
import { Save, Bell, Globe, Brain, Wrench, Users } from 'lucide-react'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({
    general: {
      siteName: 'O&M Management System',
      siteDescription: 'Solar Panel Operations and Maintenance Platform',
      timezone: 'UTC-5',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      defaultPanelEfficiency: 20.5,
      energyLossThreshold: 5.0
    },
    ai: {
      confidenceThreshold: 85,
      autoClassification: true,
      defectDetectionModel: 'ResNet-50 v2.1',
      thermalAnalysis: true,
      crackDetectionSensitivity: 'medium',
      hotspotDetectionTemp: 10.0
    },
    notifications: {
      criticalDefectAlerts: true,
      inspectionReminders: true,
      maintenanceScheduled: true,
      weeklyReports: true,
      energyLossAlerts: true,
      thresholdBreaches: true
    },
    maintenance: {
      defaultRepairTime: 2,
      emergencyResponseTime: 4,
      schedulingBuffer: 24,
      workOrderAutoAssign: false,
      priorityEscalation: true,
      qualityCheckRequired: true
    }
  })

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'ai', name: 'AI Configuration', icon: Brain },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'maintenance', name: 'Maintenance', icon: Wrench }
  ]

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    alert('Settings saved successfully!')
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          System Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Name
            </label>
            <input
              type="text"
              className="input-field"
              value={settings.general.siteName}
              onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Timezone
            </label>
            <select
              className="input-field"
              value={settings.general.timezone}
              onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            >
              <option value="UTC-5">UTC-5 (Eastern)</option>
              <option value="UTC-6">UTC-6 (Central)</option>
              <option value="UTC-7">UTC-7 (Mountain)</option>
              <option value="UTC-8">UTC-8 (Pacific)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              System Description
            </label>
            <textarea
              className="input-field"
              rows={3}
              value={settings.general.siteDescription}
              onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Panel Efficiency (%)
            </label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              value={settings.general.defaultPanelEfficiency}
              onChange={(e) => handleSettingChange('general', 'defaultPanelEfficiency', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Energy Loss Threshold (%)
            </label>
            <input
              type="number"
              step="0.1"
              className="input-field"
              value={settings.general.energyLossThreshold}
              onChange={(e) => handleSettingChange('general', 'energyLossThreshold', parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderAISettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          AI Model Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confidence Threshold (%)
            </label>
            <input
              type="number"
              min="50"
              max="99"
              className="input-field"
              value={settings.ai.confidenceThreshold}
              onChange={(e) => handleSettingChange('ai', 'confidenceThreshold', parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum confidence for defect detection</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Detection Model
            </label>
            <select
              className="input-field"
              value={settings.ai.defectDetectionModel}
              onChange={(e) => handleSettingChange('ai', 'defectDetectionModel', e.target.value)}
            >
              <option value="ResNet-50 v2.1">ResNet-50 v2.1</option>
              <option value="YOLOv8">YOLOv8</option>
              <option value="EfficientNet-B7">EfficientNet-B7</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Crack Detection Sensitivity
            </label>
            <select
              className="input-field"
              value={settings.ai.crackDetectionSensitivity}
              onChange={(e) => handleSettingChange('ai', 'crackDetectionSensitivity', e.target.value)}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Hot Spot Temperature Threshold (°C)
            </label>
            <input
              type="number"
              step="0.5"
              className="input-field"
              value={settings.ai.hotspotDetectionTemp}
              onChange={(e) => handleSettingChange('ai', 'hotspotDetectionTemp', parseFloat(e.target.value))}
            />
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {Object.entries(settings.ai).filter(([key]) => ['autoClassification', 'thermalAnalysis'].includes(key)).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {key === 'autoClassification' ? 'Automatic Defect Classification' : 'Thermal Analysis'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {key === 'autoClassification' && 'Automatically classify detected defects'}
                  {key === 'thermalAnalysis' && 'Enable thermal imaging analysis for hot spots'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value}
                  onChange={(e) => handleSettingChange('ai', key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Alert Configuration
        </h4>
        <div className="space-y-4">
          {Object.entries(settings.notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {key === 'criticalDefectAlerts' && 'Immediate alerts for high-priority defects'}
                  {key === 'inspectionReminders' && 'Reminders for scheduled inspections'}
                  {key === 'maintenanceScheduled' && 'Notifications for maintenance activities'}
                  {key === 'weeklyReports' && 'Weekly summary reports'}
                  {key === 'energyLossAlerts' && 'Alerts when energy loss exceeds threshold'}
                  {key === 'thresholdBreaches' && 'Notifications for performance threshold breaches'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value}
                  onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderMaintenanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Maintenance Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Repair Time (hours)
            </label>
            <input
              type="number"
              step="0.5"
              className="input-field"
              value={settings.maintenance.defaultRepairTime}
              onChange={(e) => handleSettingChange('maintenance', 'defaultRepairTime', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Emergency Response Time (hours)
            </label>
            <input
              type="number"
              step="0.5"
              className="input-field"
              value={settings.maintenance.emergencyResponseTime}
              onChange={(e) => handleSettingChange('maintenance', 'emergencyResponseTime', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Scheduling Buffer (hours)
            </label>
            <input
              type="number"
              className="input-field"
              value={settings.maintenance.schedulingBuffer}
              onChange={(e) => handleSettingChange('maintenance', 'schedulingBuffer', parseInt(e.target.value))}
            />
            <p className="text-xs text-gray-500 mt-1">Buffer time between maintenance tasks</p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {Object.entries(settings.maintenance).filter(([key]) => ['workOrderAutoAssign', 'priorityEscalation', 'qualityCheckRequired'].includes(key)).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {key === 'workOrderAutoAssign' ? 'Auto-assign Work Orders' : 
                   key === 'priorityEscalation' ? 'Priority Escalation' : 
                   'Quality Check Required'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {key === 'workOrderAutoAssign' && 'Automatically assign new work orders to available staff'}
                  {key === 'priorityEscalation' && 'Escalate priority for overdue tasks'}
                  {key === 'qualityCheckRequired' && 'Require quality verification after repairs'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={value}
                  onChange={(e) => handleSettingChange('maintenance', key, e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
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
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="btn-primary inline-flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
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

        {/* Settings content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-body">
              {activeTab === 'general' && renderGeneralSettings()}
              {activeTab === 'ai' && renderAISettings()}
              {activeTab === 'notifications' && renderNotificationSettings()}
              {activeTab === 'maintenance' && renderMaintenanceSettings()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
