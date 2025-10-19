import React from 'react'

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">
          Configure your Shadow Chameleon instance
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          System Configuration
        </h2>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            <p>Backend API: http://localhost:8000</p>
            <p>Database: PostgreSQL (Connected)</p>
            <p>Neo4j: Not Connected</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-yellow-800">
          Development Mode
        </h3>
        <p className="text-sm text-yellow-700 mt-1">
          This is a development preview. Additional settings will be available in future releases.
        </p>
      </div>
    </div>
  )
}

export default SettingsPage
