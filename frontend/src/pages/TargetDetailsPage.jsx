import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, Calendar, Clock, Target as TargetIcon } from 'lucide-react'
import { reconService } from '../services/reconService'
import LoadingSpinner from '../components/Common/LoadingSpinner'
import { formatDateTime, formatRelativeTime } from '../utils/formatters'

const TargetDetailsPage = () => {
  const { id } = useParams()
  
  const { data: target, isLoading, error } = useQuery(
    ['target', id],
    () => reconService.getTarget(id),
    {
      refetchInterval: 3000, // Refresh every 3 seconds for status updates
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !target) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          Target Not Found
        </h2>
        <p className="text-gray-500 mb-4">
          The requested target could not be loaded.
        </p>
        <Link
          to="/recon"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Reconnaissance
        </Link>
      </div>
    )
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      scanning: 'bg-blue-100 text-blue-800', 
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.pending
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/recon"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Targets</span>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Target Details</h1>
            <p className="text-gray-600 mt-2">
              Detailed information for {target.target}
            </p>
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(target.status)}`}>
          {target.status.toUpperCase()}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Target Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Target Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TargetIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Target</p>
                  <p className="text-sm text-gray-600">{target.target}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(target.created_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatRelativeTime(target.created_at)}
                  </p>
                </div>
              </div>

              {target.scan_completed_at && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Completed</p>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(target.scan_completed_at)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(target.scan_completed_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scan Results */}
          {target.scan_results && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Scan Results
              </h2>
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(target.scan_results, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Scan Type */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">Scan Type</h3>
            <div className={`px-3 py-2 rounded-lg text-sm font-medium ${
              target.scan_type === 'quick' ? 'bg-green-50 text-green-700' :
              target.scan_type === 'comprehensive' ? 'bg-blue-50 text-blue-700' :
              target.scan_type === 'stealth' ? 'bg-purple-50 text-purple-700' :
              'bg-orange-50 text-orange-700'
            }`}>
              {target.scan_type?.toUpperCase() || 'QUICK'}
            </div>
          </div>

          {/* Notes */}
          {target.note && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              <p className="text-sm text-gray-600">{target.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TargetDetailsPage
