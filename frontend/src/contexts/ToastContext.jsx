import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

const ToastContainer = ({ toasts, removeToast }) => {
  const getToastStyles = (type) => {
    const baseStyles = "max-w-sm w-full shadow-lg rounded-lg pointer-events-auto flex"
    const typeStyles = {
      success: "bg-green-50 border border-green-200",
      error: "bg-red-50 border border-red-200", 
      warning: "bg-yellow-50 border border-yellow-200",
      info: "bg-blue-50 border border-blue-200"
    }
    return `${baseStyles} ${typeStyles[type] || typeStyles.info}`
  }

  const getIconStyles = (type) => {
    const styles = {
      success: "text-green-400",
      error: "text-red-400",
      warning: "text-yellow-400", 
      info: "text-blue-400"
    }
    return styles[type] || styles.info
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={getToastStyles(toast.type)}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={getIconStyles(toast.type)}>
                  {toast.type === 'success' && '✓'}
                  {toast.type === 'error' && '✕'}
                  {toast.type === 'warning' && '⚠'}
                  {toast.type === 'info' && 'ℹ'}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => removeToast(toast.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-800 focus:outline-none"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export default ToastContext
