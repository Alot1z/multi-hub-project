import React from 'react'
import { BuildConfig } from '../../types/build'
import { BasicInfoStep } from './steps/BasicInfoStep'
import { FeaturesStep } from './steps/FeaturesStep'
import { PermissionsStep } from './steps/PermissionsStep'
import { BuildOptionsStep } from './steps/BuildOptionsStep'

interface ConfigurationWizardProps {
  config: BuildConfig
  setConfig: (config: BuildConfig) => void
  onBuild: () => void
  building: boolean
}

export const ConfigurationWizard: React.FC<ConfigurationWizardProps> = ({
  config,
  setConfig,
  onBuild,
  building
}) => {
  const updateConfig = (updates: Partial<BuildConfig>) => {
    setConfig({ ...config, ...updates })
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">App Configuration</h2>
        
        <div className="space-y-8">
          <BasicInfoStep config={config} updateConfig={updateConfig} />
          <FeaturesStep config={config} updateConfig={updateConfig} />
          <PermissionsStep config={config} updateConfig={updateConfig} />
          <BuildOptionsStep config={config} updateConfig={updateConfig} />
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={onBuild}
            disabled={building || !config.appName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {building ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Building App...
              </span>
            ) : (
              '🚀 Build iOS App'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}