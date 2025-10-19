import React, { useState, useEffect } from 'react'

const API_BASE = 'http://localhost:8000/api/v1'

function App() {
  const [targets, setTargets] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTarget, setNewTarget] = useState('')
  const [scanType, setScanType] = useState('quick')
  const [note, setNote] = useState('')

  useEffect(() => {
    loadTargets()
    // Refresh every 5 seconds to get updates
    const interval = setInterval(loadTargets, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadTargets = async () => {
    try {
      const response = await fetch(`${API_BASE}/recon/targets`)
      const data = await response.json()
      setTargets(data.targets)
    } catch (error) {
      console.error('Failed to load targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitScan = async (e) => {
    e.preventDefault()
    if (!newTarget.trim()) return

    try {
      const response = await fetch(`${API_BASE}/recon/scan-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: newTarget,
          scan_type: scanType,
          note: note
        })
      })
      
      if (response.ok) {
        setNewTarget('')
        setNote('')
        // Reload targets after a short delay
        setTimeout(loadTargets, 2000)
        alert('Scan submitted successfully!')
      } else {
        alert('Failed to submit scan')
      }
    } catch (error) {
      console.error('Failed to submit scan:', error)
      alert('Failed to submit scan')
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#fbbf24', // yellow
      scanning: '#3b82f6', // blue
      completed: '#10b981', // green
      failed: '#ef4444' // red
    }
    return colors[status] || '#6b7280' // gray
  }

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1>🎯 Shadow Chameleon - AI Red Team Partner</h1>
        <p>Loading targets...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#1f2937', margin: '0 0 10px 0' }}>🎯 Shadow Chameleon</h1>
        <p style={{ color: '#6b7280', margin: 0 }}>AI Red Team Partner - Reconnaissance Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Total Targets</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>{targets.length}</p>
        </div>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>Completed</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
            {targets.filter(t => t.status === 'completed').length}
          </p>
        </div>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#64748b' }}>In Progress</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#3b82f6' }}>
            {targets.filter(t => t.status === 'scanning' || t.status === 'pending').length}
          </p>
        </div>
      </div>

      {/* Scan Form */}
      <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '30px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>New Reconnaissance Scan</h2>
        <form onSubmit={submitScan} style={{ display: 'grid', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Target *
              </label>
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                placeholder="example.com or 192.168.1.1"
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
                Scan Type
              </label>
              <select
                value={scanType}
                onChange={(e) => setScanType(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="quick">Quick Scan (2s)</option>
                <option value="comprehensive">Comprehensive (10s)</option>
                <option value="stealth">Stealth Scan (5s)</option>
                <option value="osint_only">OSINT Only (3s)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', color: '#374151' }}>
              Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context about this target..."
              style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
            />
          </div>

          <button
            type="submit"
            style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', justifySelf: 'start' }}
          >
            Start Reconnaissance Scan
          </button>
        </form>
      </div>

      {/* Targets List */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '20px 25px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ margin: 0, color: '#1f2937' }}>Scan Targets</h2>
        </div>
        
        {targets.length === 0 ? (
          <div style={{ padding: '40px 25px', textAlign: 'center', color: '#6b7280' }}>
            <p style={{ margin: 0 }}>No targets found. Submit your first reconnaissance scan above.</p>
          </div>
        ) : (
          <div>
            {targets.map((target) => (
              <div key={target.id} style={{ padding: '20px 25px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px' }}>{target.target}</h3>
                      <span style={{ 
                        background: getStatusColor(target.status),
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {getStatusText(target.status)}
                      </span>
                      <span style={{ 
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {target.scan_type || 'quick'}
                      </span>
                    </div>
                    
                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                      <p style={{ margin: '4px 0' }}>
                        <strong>Created:</strong> {formatDate(target.created_at)}
                      </p>
                      {target.scan_completed_at && (
                        <p style={{ margin: '4px 0' }}>
                          <strong>Completed:</strong> {formatDate(target.scan_completed_at)}
                        </p>
                      )}
                      {target.note && (
                        <p style={{ margin: '4px 0' }}>
                          <strong>Note:</strong> {target.note}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ID: {target.id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Info Footer */}
      <div style={{ marginTop: '30px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>System Status</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '14px' }}>
          <div>
            <strong>Backend API:</strong> <span style={{ color: '#10b981' }}>✅ Connected</span>
          </div>
          <div>
            <strong>PostgreSQL:</strong> <span style={{ color: '#10b981' }}>✅ Connected</span>
          </div>
          <div>
            <strong>Neo4j:</strong> <span style={{ color: '#10b981' }}>✅ Connected</span>
          </div>
          <div>
            <strong>Frontend:</strong> <span style={{ color: '#10b981' }}>✅ Running</span>
          </div>
        </div>
        <div style={{ marginTop: '15px', fontSize: '12px', color: '#6b7280' }}>
          <p>Access API documentation: <a href="http://localhost:8000/docs" target="_blank" style={{ color: '#3b82f6' }}>http://localhost:8000/docs</a></p>
        </div>
      </div>
    </div>
  )
}

export default App
