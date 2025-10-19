import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { reconService } from '../services/reconService'

const AppContext = createContext()

const appReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_TARGETS':
      return { ...state, targets: action.payload }
    case 'ADD_TARGET':
      return { ...state, targets: [action.payload, ...state.targets] }
    case 'UPDATE_TARGET':
      return {
        ...state,
        targets: state.targets.map(target =>
          target.id === action.payload.id ? action.payload : target
        )
      }
    case 'SET_STATS':
      return { ...state, stats: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const initialState = {
  loading: false,
  targets: [],
  stats: {
    total: 0,
    completed: 0,
    scanning: 0,
    pending: 0
  },
  error: null
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Load initial data
  useEffect(() => {
    loadTargets()
    loadStats()
  }, [])

  const loadTargets = async (params = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const data = await reconService.listTargets(params)
      dispatch({ type: 'SET_TARGETS', payload: data.targets })
      
      // Calculate stats
      const stats = {
        total: data.total,
        completed: data.targets.filter(t => t.status === 'completed').length,
        scanning: data.targets.filter(t => t.status === 'scanning').length,
        pending: data.targets.filter(t => t.status === 'pending').length
      }
      dispatch({ type: 'SET_STATS', payload: stats })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const addTarget = (target) => {
    dispatch({ type: 'ADD_TARGET', payload: target })
  }

  const updateTarget = (target) => {
    dispatch({ type: 'UPDATE_TARGET', payload: target })
  }

  const value = {
    ...state,
    loadTargets,
    addTarget,
    updateTarget
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
