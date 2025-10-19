import api from './api'

export const reconService = {
  // Scan Management
  submitScan: async (scanData) => {
    const response = await api.post('/recon/scan-request', scanData)
    return response.data
  },

  getTarget: async (targetId) => {
    const response = await api.get(`/recon/target/${targetId}`)
    return response.data
  },

  listTargets: async (params = {}) => {
    const response = await api.get('/recon/targets', { params })
    return response.data
  },

  deleteTarget: async (targetId) => {
    const response = await api.delete(`/recon/target/${targetId}`)
    return response.data
  },

  // Health checks
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  },

  aliveCheck: async () => {
    const response = await api.get('/alive')
    return response.data
  },
}

// Constants for scan types and statuses
export const SCAN_TYPES = {
  quick: { label: 'Quick Scan', duration: '2s', color: 'green' },
  comprehensive: { label: 'Comprehensive', duration: '10s', color: 'blue' },
  stealth: { label: 'Stealth Scan', duration: '5s', color: 'purple' },
  osint_only: { label: 'OSINT Only', duration: '3s', color: 'orange' },
}

export const TARGET_STATUS = {
  pending: { label: 'Pending', color: 'gray' },
  scanning: { label: 'Scanning', color: 'blue' },
  completed: { label: 'Completed', color: 'green' },
  failed: { label: 'Failed', color: 'red' },
}
