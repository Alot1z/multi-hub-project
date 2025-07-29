import React from 'react'
import { BuildConfig } from '../../../types/build'

interface PermissionsStepProps {
  config: BuildConfig
  updateConfig: (updates: Partial<BuildConfig>) => void
}

const PERMISSION_CATEGORIES = {
  standard: {
    title: '🏠 Standard iOS',
    permissions: [
      { id: 'camera', name: 'Camera Access', required: false },
      { id: 'location', name: 'Location Services', required: false },
      { id: 'notifications', name: 'Push Notifications', required: false },
      { id: 'contacts', name: 'Contacts Access', required: false }
    ]
  },
  trollstore: {
    title: '🔓 TrollStore Enhanced',
    permissions: [
      { id: 'com.apple.private.security.no-container', name: 'No Container Restriction', required: true },
      { id: 'com.apple.private.skip-library-validation', name: 'Skip Library Validation', required: true },
      { id: 'com.apple.private.tcc.allow', name: 'TCC Bypass', required: false }
    ]
  },
  rootful: {
    title: '⚡ Rootful (17.0 Only)',
    permissions: [
      { id: 'com.apple.private.security.no-sandbox', name: 'Root File System Access', required: false },
      { id: 'com.apple.private.security.system-application', name: 'System Application Rights', required: false },
      { id: 'com.apple.private.kernel.get-kext-info', name: 'Kernel Extension Info', required: false }
    ]
  }
}

export const PermissionsStep: React.FC<PermissionsStepProps> = ({ config, updateConfig }) => {
  const togglePermission = (permissionId: string) => {
    const permissions = config.permissions.includes(permissionId)
      ? config.permissions.filter(p => p !== permissionId)
      : [...config.permissions, permissionId]
    
    updateConfig({ permissions })
  }

  const isRelevantCategory = (categoryKey: string) => {
    if (categoryKey === 'standard') return true
    if (categoryKey === 'trollstore') return config.appType.includes('trollstore')
    if (categoryKey === 'rootful') return config.appType === 'trollstore-17.0'
    return false
  }

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">🔐 App Permissions</h3>
      
      <div className="space-y-6">
        {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => {
          if (!isRelevantCategory(categoryKey)) return null
          
          return (
            <div key={categoryKey}>
              <h4 className="font-medium mb-3">{category.title}</h4>
              <div className="space-y-2">
                {category.permissions.map(permission => (
                  <label key={permission.id} className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                    <input
                      type="checkbox"
                      checked={config.permissions.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                      className="mr-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <span className="font-medium">{permission.name}</span>
                      {permission.required && (
                        <span className="ml-2 px-2 py-1 bg-red-600 text-xs rounded">Required</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      
      {config.permissions.length > 0 && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="text-sm text-yellow-400">
            ⚠️ Selected permissions: {config.permissions.length}
            <br />
            Some permissions may require TrollStore or jailbreak environment.
          </div>
        </div>
      )}
    </div>
  )
}