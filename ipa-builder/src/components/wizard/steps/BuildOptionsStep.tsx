import React from 'react'
import { BuildConfig } from '../../../types/build'

interface BuildOptionsStepProps {
  config: BuildConfig
  updateConfig: (updates: Partial<BuildConfig>) => void
}

export const BuildOptionsStep: React.FC<BuildOptionsStepProps> = ({ config, updateConfig }) => {
  const updateBuildOptions = (option: string, value: boolean) => {
    const buildOptions = {
      enableDebug: false,
      stripSymbols: true,
      optimizeSize: true,
      includeSymbols: false,
      ...config.buildOptions,
      [option]: value
    }
    
    updateConfig({ buildOptions })
  }

  const buildOptions = config.buildOptions || {
    enableDebug: false,
    stripSymbols: true,
    optimizeSize: true,
    includeSymbols: false
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">🔧 Build Options</h3>
      
      <div className="space-y-4">
        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <div className="font-medium">Enable Debug Mode</div>
            <div className="text-sm text-gray-400">Include debug symbols and logging</div>
          </div>
          <input
            type="checkbox"
            checked={buildOptions.enableDebug}
            onChange={(e) => updateBuildOptions('enableDebug', e.target.checked)}
            className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <div className="font-medium">Strip Symbols</div>
            <div className="text-sm text-gray-400">Remove debug symbols to reduce size</div>
          </div>
          <input
            type="checkbox"
            checked={buildOptions.stripSymbols}
            onChange={(e) => updateBuildOptions('stripSymbols', e.target.checked)}
            className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <div className="font-medium">Optimize for Size</div>
            <div className="text-sm text-gray-400">Enable size optimizations</div>
          </div>
          <input
            type="checkbox"
            checked={buildOptions.optimizeSize}
            onChange={(e) => updateBuildOptions('optimizeSize', e.target.checked)}
            className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <div className="font-medium">Include Symbols</div>
            <div className="text-sm text-gray-400">Keep symbols for crash reporting</div>
          </div>
          <input
            type="checkbox"
            checked={buildOptions.includeSymbols}
            onChange={(e) => updateBuildOptions('includeSymbols', e.target.checked)}
            className="text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </label>
      </div>

      <div className="mt-4 p-3 bg-gray-700 rounded-lg">
        <h4 className="font-medium mb-2">Build Summary</h4>
        <div className="text-sm text-gray-400 space-y-1">
          <div>App Type: <span className="text-white">{config.appType}</span></div>
          <div>Target iOS: <span className="text-white">{config.targetVersion}+</span></div>
          <div>Features: <span className="text-white">{config.features.length} selected</span></div>
          <div>Permissions: <span className="text-white">{config.permissions.length} granted</span></div>
        </div>
      </div>
    </div>
  )
}