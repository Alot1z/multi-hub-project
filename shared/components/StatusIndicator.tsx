/**
 * 📊 Status Indicator Component - Shared across all platforms
 */

import React from 'react'

interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'info' | 'loading'
  message?: string
  className?: string
  showIcon?: boolean
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  className = '',
  showIcon = true
}) => {
  const statusConfig = {
    success: {
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      icon: '✅'
    },
    error: {
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      icon: '❌'
    },
    warning: {
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      icon: '⚠️'
    },
    info: {
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      icon: 'ℹ️'
    },
    loading: {
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-800',
      borderColor: 'border-gray-200',
      icon: '🔄'
    }
  }

  const config = statusConfig[status]

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border
        ${config.bgColor}
        ${config.textColor}
        ${config.borderColor}
        ${className}
      `}
    >
      {showIcon && (
        <span className="text-sm" role="img" aria-label={status}>
          {config.icon}
        </span>
      )}
      {message && (
        <span className="text-sm font-medium">{message}</span>
      )}
    </div>
  )
}

export default StatusIndicator
