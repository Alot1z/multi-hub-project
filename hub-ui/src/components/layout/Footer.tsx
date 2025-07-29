import React from 'react'
import { usePlatform } from '../../contexts/PlatformContext'

export const Footer: React.FC = () => {
  const { config } = usePlatform()

  return (
    <footer className="bg-gray-800 border-t border-gray-700 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div className="flex items-center space-x-4">
            <span>© 2024 Multi-Hub Platform</span>
            <span>•</span>
            <span>100% Open Source</span>
          </div>
          
          {config && (
            <div className="flex items-center space-x-4">
              <span>Cache: {config.cache_strategy.models}</span>
              <span>•</span>
              <span>Base: {config.base_url}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}