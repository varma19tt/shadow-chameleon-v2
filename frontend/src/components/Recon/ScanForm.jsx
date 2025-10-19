import React, { useState } from 'react'
import { X, Scan, Clock, Shield, Eye } from 'lucide-react'
import { SCAN_TYPES } from '../../services/reconService'

const ScanForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    target: '',
    note: '',
    scan_type: 'quick'
  })

  const [errors, setErrors] = useState({})

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit(formData)
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.target.trim()) {
      errors.target = 'Target is required'
    } else if (formData.target.length > 255) {
      errors.target = 'Target must be less than 255 characters'
    }

    if (formData.note && formData.note.length > 500) {
      errors.note = 'Note must be less than 500 characters'
    }

    return errors
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getScanTypeIcon = (type) => {
    const icons = {
      quick: Scan,
      comprehensive: Clock,
      stealth: Eye,
      osint_only: Shield
    }
    return icons[type] || Scan
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Reconnaissance Scan</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target *
            </label>
            <input
              type="text"
              value={formData.target}
              onChange={(e) => handleChange('target', e.target.value)}
              placeholder="example.com or 192.168.1.1"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.target ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.target && (
              <p className="mt-1 text-sm text-red-600">{errors.target}</p>
            )}
          </div>

          {/* Scan Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Scan Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(SCAN_TYPES).map(([key, config]) => {
                const Icon = getScanTypeIcon(key)
                return (
                  <label
                    key={key}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.scan_type === key
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scan_type"
                      value={key}
                      checked={formData.scan_type === key}
                      onChange={(e) => handleChange('scan_type', e.target.value)}
                      className="sr-only"
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full ${
                          formData.scan_type === key ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            formData.scan_type === key ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {config.label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {config.duration}
                          </p>
                        </div>
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              placeholder="Add context about this target..."
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.note ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.note && (
              <p className="mt-1 text-sm text-red-600">{errors.note}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.note.length}/500 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Submitting...' : 'Start Scan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScanForm
