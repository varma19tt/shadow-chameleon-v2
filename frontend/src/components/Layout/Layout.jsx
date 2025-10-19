import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useApp } from '../../../contexts/AppContext'

const Layout = ({ children }) => {
  const { stats } = useApp()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
