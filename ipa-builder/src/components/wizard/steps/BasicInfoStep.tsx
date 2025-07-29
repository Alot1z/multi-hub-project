import React from 'react'
import { BuildConfig } from '../../../types/build'

interface BasicInfoStepProps {
  config: BuildConfig
  updateConfig: (updates: Partial<BuildConfig>) => void
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ config, updateConfig }) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">📱 Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">App Name *</label>
          <input
            type="text"
            value={config.appName}
            onChange={(e) => updateConfig({ appName: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="My Awesome App"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">App Type</label>
          <select
            value={config.appType}
            onChange={(e) => updateConfig({ appType: e.target.value as BuildConfig['appType'] })}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="universal">Universal iOS App</option>
            <option value="trollstore-15.5">TrollStore 15.5 (Semi-Jailbreak)</option>
            <option value="trollstore-17.0">TrollStore 17.0 (Rootful)</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Target iOS Version</label>
        <select
          value={config.targetVersion}
          onChange={(e) => updateConfig({ targetVersion: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="13.0">iOS 13.0+</option>
          <option value="14.0">iOS 14.0+</option>
          <option value="15.0">iOS 15.0+</option>
          <option value="16.0">iOS 16.0+</option>
          <option value="17.0">iOS 17.0+</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          value={config.description}
          onChange={(e) => updateConfig({ description: e.target.value })}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 h-24 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe what your app does..."
        />
      </div>
    </div>
  )
}