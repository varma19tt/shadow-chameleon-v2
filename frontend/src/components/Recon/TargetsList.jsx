import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  MoreVertical,
  ExternalLink
} from 'lucide-react'
import TargetCard from './TargetCard'
import Pagination from '../Common/Pagination'
import LoadingSpinner from '../Common/LoadingSpinner'
import EmptyState from '../Common/EmptyState'

const TargetsList = ({ targets, loading, error, pagination }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Error loading targets"
        description={error.message}
        action={{
          label: 'Try Again',
          onClick: () => window.location.reload()
        }}
      />
    )
  }

  if (targets.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="No targets found"
        description="Get started by submitting your first reconnaissance scan."
        action={{
          label: 'Start Scanning',
          onClick: () => {/* Open scan form */}
        }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Targets Grid */}
      <div className="grid gap-4">
        {targets.map((target) => (
          <TargetCard key={target.id} target={target} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex justify-center pt-6">
          <Pagination
            currentPage={pagination.page}
            pageSize={pagination.pageSize}
            totalItems={pagination.total}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </div>
  )
}

export default TargetsList
