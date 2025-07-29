import React from 'react'
import { BuildConfig } from '../../../types/build'

interface FeaturesStepProps {
  config: BuildConfig
  updateConfig: (updates: Partial<BuildConfig>) => void
}

const AVAILABLE_FEATURES = [
  { id: 'file-manager', name: 'File Manager', description: 'Browse and manage files' },
  { id: 'network-access', name: 'Network Access', description: 'HTTP requests and API calls' },
  { id: 'camera', name: 'Camera Access', description: 'Take photos and videos' },
  { id: 'location', name: 'Location Services', description: 'GPS and location data' },
  { id: 'notifications', name: 'Push Notifications', description: 'Send notifications to users' },
  { id: 'background-tasks', name: 'Background Tasks', description: 'Run tasks in background' },
  { id: 'system-access', name: 'System Access', description: 'Access system APIs (TrollStore only)' },
  { id: 'custom-ui', name: 'Custom UI', description: 'Advanced UI components' }
]

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ config, updateConfig }) => {
  const toggleFeature = (featureId: string) => {
    const features = config.features.includes(featureId)
      ? config.features.filter(f => f !== featureId)
      : [...config.features, featureId]
    
    updateConfig({ features })
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">⚡ App Features</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {AVAILABLE_FEATURES.map(feature => (
          <label key={feature.id} className="flex items-start p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
            <input
              type="checkbox"
              checked={config.features.includes(feature.id)}
              onChange={() => toggleFeature(feature.id)}
              className="mt-1 mr-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div>
              <div className="font-medium">{feature.name}</div>
              <div className="text-sm text-gray-400">{feature.description}</div>
            </div>
          </label>
        ))}
      </div>
      
      {config.features.length > 0 && (
        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <div className="text-sm text-blue-400">
            Selected features: {config.features.length}
          </div>
        </div>
      )}
    </div>
  )
}