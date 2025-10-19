import React from 'react'
import { Target, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Targets',
      value: stats.total,
      icon: Target,
      color: 'blue',
      description: 'All scanned targets'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'green',
      description: 'Successfully scanned'
    },
    {
      title: 'In Progress',
      value: stats.scanning,
      icon: Clock,
      color: 'yellow',
      description: 'Currently scanning'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'gray',
      description: 'Waiting for scan'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      gray: 'bg-gray-50 text-gray-600 border-gray-200'
    }
    return colors[color] || colors.gray
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`p-6 rounded-lg border-2 ${getColorClasses(card.color)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{card.title}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
              <p className="text-xs mt-1 opacity-75">{card.description}</p>
            </div>
            <div className={`p-3 rounded-full ${getColorClasses(card.color)}`}>
              <card.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards
