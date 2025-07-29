import React from 'react'

interface StatusIndicatorProps {
  loading: boolean
  error?: string | null
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ loading, error }) => {
  if (loading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center">
        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
        <span className="text-sm text-red-400">Error</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
      <span className="text-sm text-green-400">Online</span>
    </div>
  )
}