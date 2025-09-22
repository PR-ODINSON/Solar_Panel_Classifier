import React, { useState } from 'react'
import { 
  Search, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Send
} from 'lucide-react'

const HelpSupport = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: '',
    category: 'general',
    message: ''
  })

  // Mock FAQ data
  const faqs = [
    {
      id: 1,
      question: 'How do I update the status of my assigned tasks?',
      answer: 'To update task status, go to "My Tasks" page, find your task, and use the action buttons (Start Task, Complete, Pause) or click "Update" to add notes and change progress.',
      category: 'tasks'
    },
    {
      id: 2,
      question: 'Where can I view my work schedule?',
      answer: 'Your work schedule is available on your dashboard under "Upcoming Schedule". You can also check the calendar view in the main navigation menu.',
      category: 'schedule'
    },
    {
      id: 3,
      question: 'How do I report an emergency or critical issue?',
      answer: 'For emergencies, use the red "Report Issue" button on your dashboard or call the emergency hotline at (555) 911-HELP. For critical issues, mark them as "High Priority" when reporting.',
      category: 'emergency'
    },
    {
      id: 4,
      question: 'Can I request time off through the system?',
      answer: 'Time off requests should be submitted through your supervisor or HR department. The maintenance system is currently for task management only.',
      category: 'general'
    },
    {
      id: 5,
      question: 'How do I access safety protocols and procedures?',
      answer: 'Safety protocols are available in the "Resources" section of your profile page. You can also find them in the company handbook or contact your supervisor.',
      category: 'safety'
    },
    {
      id: 6,
      question: 'What should I do if I cannot complete a task on time?',
      answer: 'Contact your supervisor immediately and update the task with a note explaining the delay. You can also request a deadline extension through the task update form.',
      category: 'tasks'
    }
  ]

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const quickActions = [
    {
      title: 'Contact Supervisor',
      description: 'Reach out to your direct supervisor',
      icon: Phone,
      action: () => alert('Calling supervisor...'),
      color: 'blue'
    },
    {
      title: 'Report Emergency',
      description: 'Report critical safety issues',
      icon: AlertTriangle,
      action: () => alert('Emergency reporting...'),
      color: 'red'
    },
    {
      title: 'IT Support',
      description: 'Get help with technical issues',
      icon: MessageCircle,
      action: () => setShowContactForm(true),
      color: 'green'
    },
    {
      title: 'Documentation',
      description: 'Access user manuals and guides',
      icon: FileText,
      action: () => alert('Opening documentation...'),
      color: 'purple'
    }
  ]

  const handleContactSubmit = (e) => {
    e.preventDefault()
    alert('Support request submitted successfully!')
    setShowContactForm(false)
    setContactForm({ subject: '', category: 'general', message: '' })
  }

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Help & Support
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Get help and find answers to common questions
          </p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickActions.map((action) => (
          <button
            key={action.title}
            onClick={action.action}
            className="card hover:shadow-md transition-all duration-200 group"
          >
            <div className="card-body text-center">
              <div className={`p-3 rounded-full mx-auto mb-3 ${
                action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                action.color === 'red' ? 'bg-red-100 text-red-600' :
                action.color === 'green' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              } group-hover:scale-110 transition-transform`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {action.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {action.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Contact information */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Emergency Contacts
          </h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full w-12 h-12 mx-auto mb-3">
                <Phone className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Emergency Hotline
              </h4>
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                (555) 911-HELP
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                24/7 Emergency Support
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                Supervisor
              </h4>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                (555) 123-4567
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Jane Smith - Maintenance Manager
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full w-12 h-12 mx-auto mb-3">
                <Mail className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                IT Support
              </h4>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                help@company.com
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Technical assistance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>
        <div className="card-body">
          {/* Search FAQs */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search frequently asked questions..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {faq.question}
                  </span>
                  {expandedFaq === faq.id ? (
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Try adjusting your search terms or contact support directly.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact form */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Contact Support
            </h3>
            <button
              onClick={() => setShowContactForm(!showContactForm)}
              className="btn-primary text-sm"
            >
              {showContactForm ? 'Cancel' : 'New Request'}
            </button>
          </div>
        </div>
        {showContactForm && (
          <div className="card-body">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Brief description of your issue"
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    className="input-field"
                    value={contactForm.category}
                    onChange={(e) => setContactForm({...contactForm, category: e.target.value})}
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="account">Account Problem</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Please describe your issue in detail..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary inline-flex items-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default HelpSupport
