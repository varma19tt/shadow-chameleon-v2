import { useEffect, useRef, useCallback } from 'react'
import { useToast } from './useToast'

export const useWebSocket = (url) => {
  const ws = useRef(null)
  const { showToast } = useToast()

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url)
      
      ws.current.onopen = () => {
        console.log('WebSocket connected')
        showToast('Connected to real-time updates', 'success')
      }

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('WebSocket message:', data)
        
        // Handle different message types
        switch (data.type) {
          case 'scan_update':
            // Update scan status in real-time
            showToast(`Scan ${data.target_id} ${data.status}`, 'info')
            break
          case 'system_alert':
            showToast(data.message, 'warning')
            break
          default:
            console.log('Unknown message type:', data.type)
        }
      }

      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
        showToast('Disconnected from real-time updates', 'error')
        // Attempt reconnection after delay
        setTimeout(() => connect(), 5000)
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        showToast('WebSocket connection error', 'error')
      }
    } catch (error) {
      console.error('WebSocket connection failed:', error)
    }
  }, [url, showToast])

  useEffect(() => {
    connect()
    
    return () => {
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    }
  }, [])

  return { sendMessage }
}
