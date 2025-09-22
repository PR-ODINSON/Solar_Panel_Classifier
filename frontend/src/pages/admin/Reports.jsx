import React, { useState } from 'react'
import { Download, FileText, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react'

const Reports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock reports data
  const availableReports = [
    {
      id: 1,
      name: 'User Activity Report',
      description: 'Detailed analysis of user login patterns and activity levels',
      category: 'user',
      format: 'PDF',
      size: '2.3 MB',
      lastGenerated: '2024-01-20T10:30:00Z',
      icon: BarChart3
    },
    {
      id: 2,
      name: 'Maintenance Summary',
      description: 'Overview of completed, pending, and overdue maintenance tasks',
      category: 'maintenance',
      format: 'Excel',
      size: '1.8 MB',
      lastGenerated: '2024-01-20T09:15:00Z',
      icon: FileText
    },
    {
      id: 3,
      name: 'System Performance Analytics',
      description: 'Performance metrics, uptime statistics, and system health indicators',
      category: 'system',
      format: 'PDF',
      size: '3.1 MB',
      lastGenerated: '2024-01-19T16:45:00Z',
      icon: TrendingUp
    },
    {
      id: 4,
      name: 'Financial Cost Analysis',
      description: 'Breakdown of maintenance costs by category and time period',
      category: 'financial',
      format: 'Excel',
      size: '2.7 MB',
      lastGenerated: '2024-01-19T14:20:00Z',
      icon: PieChart
    }
  ]

  const reportCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'user', label: 'User Reports' },
    { value: 'maintenance', label: 'Maintenance Reports' },
    { value: 'system', label: 'System Reports' },
    { value: 'financial', label: 'Financial Reports' }
  ]

  const timePeriods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ]

  const filteredReports = availableReports.filter(report => 
    selectedCategory === 'all' || report.category === selectedCategory
  )

  const handleGenerateReport = (reportId) => {
    alert(`Generating report ${reportId} for ${selectedPeriod} period...`)
  }

  const handleDownloadReport = (reportId, reportName) => {
    alert(`Downloading ${reportName}...`)
  }

  const getCategoryColor = (category) => {
    const colors = {
      user: 'blue',
      maintenance: 'yellow',
      system: 'green',
      financial: 'purple'
    }
    return colors[category] || 'gray'
  }

  const quickStats = [
    {
      name: 'Total Reports Generated',
      value: '1,247',
      change: '+12% from last month',
      icon: FileText,
      color: 'blue'
    },
    {
      name: 'Most Downloaded',
      value: 'Maintenance Summary',
      change: '156 downloads this month',
      icon: Download,
      color: 'green'
    },
    {
      name: 'Average Generation Time',
      value: '2.3 mins',
      change: '-15% improvement',
      icon: TrendingUp,
      color: 'purple'
    },
    {
      name: 'Report Categories',
      value: '4',
      change: 'Active categories',
      icon: PieChart,
      color: 'yellow'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and download system reports
          </p>
        </div>
        <button className="btn-primary inline-flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Custom Report
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                  stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                  stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900' :
                  'bg-yellow-100 dark:bg-yellow-900'
                }`}>
                  <stat.icon className={`h-6 w-6 ${
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Report filters */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Report Generation
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Time Period
              </label>
              <select
                className="input-field"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {timePeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                className="input-field"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {reportCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <input
                type="date"
                className="input-field"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available reports */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Available Reports
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredReports.map((report) => {
              const color = getCategoryColor(report.category)
              return (
                <div key={report.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                        color === 'green' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <report.icon className="h-5 w-5" />
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          color === 'blue' ? 'bg-blue-100 text-blue-800' :
                          color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          color === 'green' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {report.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>Format: {report.format}</span>
                    <span>Size: {report.size}</span>
                    <span>Last: {new Date(report.lastGenerated).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleGenerateReport(report.id)}
                      className="flex-1 btn-primary text-sm"
                    >
                      Generate
                    </button>
                    <button
                      onClick={() => handleDownloadReport(report.id, report.name)}
                      className="flex-1 btn-secondary text-sm inline-flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent reports history */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Report History
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            {[
              { name: 'User Activity Report - January 2024', date: '2024-01-20T10:30:00Z', status: 'completed', size: '2.3 MB' },
              { name: 'Maintenance Summary - Weekly', date: '2024-01-20T09:15:00Z', status: 'completed', size: '1.8 MB' },
              { name: 'System Performance - Q4 2023', date: '2024-01-19T16:45:00Z', status: 'completed', size: '3.1 MB' },
              { name: 'Financial Analysis - December 2023', date: '2024-01-19T14:20:00Z', status: 'processing', size: 'Generating...' }
            ].map((historyItem, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {historyItem.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(historyItem.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    historyItem.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {historyItem.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {historyItem.size}
                  </span>
                  {historyItem.status === 'completed' && (
                    <button className="text-blue-600 hover:text-blue-800 text-xs">
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
