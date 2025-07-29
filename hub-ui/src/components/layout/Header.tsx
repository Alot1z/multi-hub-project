import React from 'react'
import { Link } from 'react-router-dom'
import { usePlatform } from '../../contexts/PlatformContext'
import { StatusIndicator } from '../common/StatusIndicator'

export const Header: React.FC = () => {
  const { config, loading } = usePlatform()

  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-2xl mr-2">🏭</span>
              <h1 className="text-2xl font-bold text-blue-400">Multi-Hub Platform</h1>
            </Link>
            {config && (
              <span className="ml-3 px-2 py-1 bg-green-600 text-xs rounded">
                v{config.version}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <StatusIndicator loading={loading} />
            {config && (
              <div className="text-sm text-gray-400">
                Models: {Object.keys(config.models).length} | 
                Projects: {Object.keys(config.subprojects).length}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}