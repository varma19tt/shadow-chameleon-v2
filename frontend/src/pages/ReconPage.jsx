import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { Plus, Search, Filter } from 'lucide-react'
import ScanForm from '../components/Recon/ScanForm'
import TargetsList from '../components/Recon/TargetsList'
import { reconService } from '../services/reconService'
import { useToast } from '../hooks/useToast'

const ReconPage = () => {
  const [showScanForm, setShowScanForm] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    page_size: 10
  })
  
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  // Fetch targets with react-query
  const { data: targetsData, isLoading, error } = useQuery(
    ['targets', filters],
    () => reconService.listTargets(filters),
    {
      keepPreviousData: true,
      refetchInterval: 5000, // Auto-refresh every 5 seconds
    }
  )

  // Submit scan mutation
  const submitScanMutation = useMutation(reconService.submitScan, {
    onSuccess: (data) => {
      showToast(`Scan submitted successfully (ID: ${data.target_id})`, 'success')
      setShowScanForm(false)
      queryClient.invalidateQueries('targets')
    },
    onError: (error) => {
      showToast(error.detail || 'Failed to submit scan', 'error')
    }
  })

  const handleScanSubmit = (scanData) => {
    submitScanMutation.mutate(scanData)
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reconnaissance</h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor your target scanning activities
          </p>
        </div>
        <button
          onClick={() => setShowScanForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Scan</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search targets..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="scanning">Scanning</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          <Filter className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Scan Form Modal */}
      {showScanForm && (
        <ScanForm
          onSubmit={handleScanSubmit}
          onCancel={() => setShowScanForm(false)}
          loading={submitScanMutation.isLoading}
        />
      )}

      {/* Targets List */}
      <TargetsList
        targets={targetsData?.targets || []}
        loading={isLoading}
        error={error}
        pagination={targetsData ? {
          page: targetsData.page,
          pageSize: targetsData.page_size,
          total: targetsData.total,
          onPageChange: (page) => handleFilterChange('page', page)
        } : null}
      />
    </div>
  )
}

export default ReconPage
