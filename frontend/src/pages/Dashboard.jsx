import React from 'react'
import { useQuery } from 'react-query'
import { Shield, Target, CheckCircle, Clock } from 'lucide-react'
import StatsCards from '../components/Dashboard/StatsCards'
import RecentScans from '../components/Dashboard/RecentScans'
import QuickActions from '../components/Dashboard/QuickActions'
import { reconService } from '../services/reconService'
import { useApp } from '../contexts/AppContext'

const Dashboard = () => {
  const { stats, targets } = useApp()
  
  const { data: healthData } = useQuery(
    'health',
    () => reconService.healthCheck(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  const recentTargets = targets.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor your reconnaissance activities and system status
        </p>
      </div>

      {/* System Status */}
      {healthData && (
        <div className={`p-4 rounded-lg border ${
          healthData.status === 'healthy' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className={`h-5 w-5 ${
                healthData.status === 'healthy' ? 'text-green-600' : 'text-red-600'
              }`} />
              <div>
                <h3 className="font-semibold">System Status: {healthData.status}</h3>
                <p className="text-sm text-gray-600">
                  PostgreSQL: {healthData.services.postgresql} • 
                  Neo4j: {healthData.services.neo4j}
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-500">
              Last checked: {new Date(healthData.timestamp * 1000).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Quick Actions & Recent Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentScans targets={recentTargets} />
        </div>
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
