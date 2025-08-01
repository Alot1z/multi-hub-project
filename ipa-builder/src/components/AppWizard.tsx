import React, { useState, useCallback, useEffect } from 'react'
import { LoadingSpinner } from '../../hub-ui/src/components/common/LoadingSpinner'
import { StatusIndicator } from '../../hub-ui/src/components/common/StatusIndicator'

interface AppConfig {
  name: string
  bundleId: string
  version: string
  buildNumber: string
  displayName: string
  description: string
  category: 'productivity' | 'entertainment' | 'utilities' | 'developer' | 'games'
  minIOSVersion: string
  targetIOSVersion: string
  deviceFamily: 'iphone' | 'ipad' | 'universal'
  orientation: 'portrait' | 'landscape' | 'all'
  backgroundModes: string[]
  permissions: string[]
  entitlements: string[]
  frameworks: string[]
  customCode: string
  assets: {
    icon: File | null
    launchScreen: File | null
    additionalAssets: File[]
  }
}

interface BuildStep {
  id: string
  name: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  logs: string[]
  duration?: number
}

interface AppWizardProps {
  className?: string
  onBuildComplete?: (ipaPath: string, config: AppConfig) => void
  onError?: (error: Error) => void
  freetierOptimized?: boolean
}

const DEFAULT_CONFIG: AppConfig = {
  name: '',
  bundleId: '',
  version: '1.0.0',
  buildNumber: '1',
  displayName: '',
  description: '',
  category: 'utilities',
  minIOSVersion: '13.0',
  targetIOSVersion: '17.0',
  deviceFamily: 'universal',
  orientation: 'all',
  backgroundModes: [],
  permissions: [],
  entitlements: [],
  frameworks: ['UIKit', 'Foundation'],
  customCode: '',
  assets: {
    icon: null,
    launchScreen: null,
    additionalAssets: []
  }
}

const AVAILABLE_PERMISSIONS = [
  'NSCameraUsageDescription',
  'NSMicrophoneUsageDescription',
  'NSLocationWhenInUseUsageDescription',
  'NSLocationAlwaysAndWhenInUseUsageDescription',
  'NSPhotoLibraryUsageDescription',
  'NSContactsUsageDescription',
  'NSCalendarsUsageDescription',
  'NSRemindersUsageDescription',
  'NSMotionUsageDescription',
  'NSHealthUpdateUsageDescription',
  'NSHealthShareUsageDescription',
  'NSBluetoothAlwaysUsageDescription',
  'NSFaceIDUsageDescription'
]

const AVAILABLE_ENTITLEMENTS = [
  'com.apple.developer.icloud-container-identifiers',
  'com.apple.developer.ubiquity-kvstore-identifier',
  'com.apple.developer.icloud-services',
  'com.apple.developer.in-app-payments',
  'com.apple.developer.associated-domains',
  'com.apple.developer.healthkit',
  'com.apple.developer.homekit',
  'com.apple.developer.networking.wifi-info',
  'com.apple.developer.networking.networkextension',
  'com.apple.developer.siri',
  'com.apple.developer.game-center',
  'com.apple.developer.maps'
]

const AVAILABLE_FRAMEWORKS = [
  'UIKit',
  'Foundation',
  'CoreData',
  'CoreLocation',
  'MapKit',
  'AVFoundation',
  'Photos',
  'Contacts',
  'EventKit',
  'HealthKit',
  'HomeKit',
  'SiriKit',
  'GameKit',
  'StoreKit',
  'CloudKit',
  'CoreML',
  'Vision',
  'ARKit',
  'RealityKit',
  'Combine',
  'SwiftUI'
]

export const AppWizard: React.FC<AppWizardProps> = ({
  className = '',
  onBuildComplete,
  onError,
  freetierOptimized = true
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG)
  const [isBuilding, setIsBuilding] = useState(false)
  const [buildSteps, setBuildSteps] = useState<BuildStep[]>([])
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const steps = [
    'Basic Information',
    'App Configuration',
    'Permissions & Entitlements',
    'Assets & Resources',
    'Custom Code',
    'Build & Deploy'
  ]

  // Validate current step
  const validateStep = useCallback((stepIndex: number): string[] => {
    const errors: string[] = []

    switch (stepIndex) {
      case 0: // Basic Information
        if (!config.name.trim()) errors.push('App name is required')
        if (!config.bundleId.trim()) errors.push('Bundle ID is required')
        if (!config.bundleId.match(/^[a-zA-Z0-9.-]+$/)) errors.push('Bundle ID contains invalid characters')
        if (!config.displayName.trim()) errors.push('Display name is required')
        if (!config.version.match(/^\d+\.\d+\.\d+$/)) errors.push('Version must be in format X.Y.Z')
        break

      case 1: // App Configuration
        if (!config.description.trim()) errors.push('App description is required')
        if (config.frameworks.length === 0) errors.push('At least one framework must be selected')
        break

      case 2: // Permissions & Entitlements
        // No required validations for this step
        break

      case 3: // Assets & Resources
        if (!config.assets.icon && !freetierOptimized) {
          errors.push('App icon is recommended')
        }
        break

      case 4: // Custom Code
        if (config.customCode.trim() && !config.customCode.includes('import')) {
          errors.push('Custom code should include proper imports')
        }
        break
    }

    return errors
  }, [config, freetierOptimized])

  // Update configuration
  const updateConfig = useCallback((updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }, [])

  // Generate bundle ID suggestion
  const generateBundleId = useCallback(() => {
    const appName = config.name.toLowerCase().replace(/[^a-z0-9]/g, '')
    const bundleId = `com.alot1z.${appName}`
    updateConfig({ bundleId })
  }, [config.name, updateConfig])

  // Handle file upload
  const handleFileUpload = useCallback((type: 'icon' | 'launchScreen', file: File) => {
    updateConfig({
      assets: {
        ...config.assets,
        [type]: file
      }
    })
  }, [config.assets, updateConfig])

  // Add additional asset
  const addAdditionalAsset = useCallback((file: File) => {
    updateConfig({
      assets: {
        ...config.assets,
        additionalAssets: [...config.assets.additionalAssets, file]
      }
    })
  }, [config.assets, updateConfig])

  // Toggle array item
  const toggleArrayItem = useCallback((array: string[], item: string, key: keyof AppConfig) => {
    const newArray = array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item]
    
    updateConfig({ [key]: newArray })
  }, [updateConfig])

  // Navigate steps
  const nextStep = useCallback(() => {
    const errors = validateStep(currentStep)
    setValidationErrors(errors)
    
    if (errors.length === 0 && currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }, [currentStep, validateStep, steps.length])

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      setValidationErrors([])
    }
  }, [currentStep])

  // Build app
  const buildApp = useCallback(async () => {
    const errors = validateStep(currentStep)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsBuilding(true)
    setValidationErrors([])

    const steps: BuildStep[] = [
      {
        id: 'validate',
        name: 'Validate Configuration',
        description: 'Validating app configuration and dependencies',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'generate',
        name: 'Generate Project',
        description: 'Generating Xcode project structure',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'assets',
        name: 'Process Assets',
        description: 'Processing app icons and launch screens',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'code',
        name: 'Compile Code',
        description: 'Compiling Swift/Objective-C code',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'sign',
        name: 'Code Signing',
        description: 'Signing app for TrollStore installation',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'package',
        name: 'Package IPA',
        description: 'Creating final IPA package',
        status: 'pending',
        progress: 0,
        logs: []
      }
    ]

    setBuildSteps(steps)

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        
        // Update step status
        setBuildSteps(prev => prev.map(s => 
          s.id === step.id ? { ...s, status: 'running' } : s
        ))

        // Simulate build process
        await simulateBuildStep(step, (progress, log) => {
          setBuildSteps(prev => prev.map(s => 
            s.id === step.id 
              ? { ...s, progress, logs: log ? [...s.logs, log] : s.logs }
              : s
          ))
        })

        // Mark step as completed
        setBuildSteps(prev => prev.map(s => 
          s.id === step.id 
            ? { ...s, status: 'completed', progress: 100, duration: Date.now() }
            : s
        ))
      }

      // Generate IPA path
      const ipaPath = `/builds/${config.name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${config.version}.ipa`
      
      onBuildComplete?.(ipaPath, config)

    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Build failed')
      
      // Mark current step as error
      setBuildSteps(prev => prev.map(s => 
        s.status === 'running' 
          ? { ...s, status: 'error', logs: [...s.logs, `Error: ${errorObj.message}`] }
          : s
      ))

      onError?.(errorObj)
    } finally {
      setIsBuilding(false)
    }
  }, [config, currentStep, validateStep, onBuildComplete, onError])

  // Simulate build step
  const simulateBuildStep = async (
    step: BuildStep, 
    onProgress: (progress: number, log?: string) => void
  ): Promise<void> => {
    const duration = freetierOptimized ? 2000 : 5000 // Faster for free tier
    const steps = 10
    const stepDuration = duration / steps

    for (let i = 0; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepDuration))
      
      const progress = (i / steps) * 100
      let log: string | undefined

      // Generate realistic logs
      switch (step.id) {
        case 'validate':
          if (i === 2) log = `✓ Bundle ID: ${config.bundleId}`
          if (i === 5) log = `✓ Frameworks: ${config.frameworks.join(', ')}`
          if (i === 8) log = `✓ Permissions: ${config.permissions.length} configured`
          break
        case 'generate':
          if (i === 3) log = '✓ Created project structure'
          if (i === 6) log = '✓ Generated Info.plist'
          if (i === 9) log = '✓ Configured build settings'
          break
        case 'assets':
          if (i === 4) log = '✓ Processed app icon'
          if (i === 7) log = '✓ Generated launch screen'
          break
        case 'code':
          if (i === 2) log = '✓ Compiled Swift sources'
          if (i === 6) log = '✓ Linked frameworks'
          if (i === 9) log = '✓ Generated binary'
          break
        case 'sign':
          if (i === 5) log = '✓ Applied TrollStore entitlements'
          if (i === 8) log = '✓ Code signing completed'
          break
        case 'package':
          if (i === 4) log = '✓ Created app bundle'
          if (i === 8) log = '✓ Generated IPA package'
          break
      }

      onProgress(progress, log)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                App Name *
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => updateConfig({ name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="My Awesome App"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bundle ID *
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={config.bundleId}
                  onChange={(e) => updateConfig({ bundleId: e.target.value })}
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="com.yourcompany.appname"
                />
                <button
                  onClick={generateBundleId}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                value={config.displayName}
                onChange={(e) => updateConfig({ displayName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="App Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Version *
                </label>
                <input
                  type="text"
                  value={config.version}
                  onChange={(e) => updateConfig({ version: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="1.0.0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Build Number
                </label>
                <input
                  type="text"
                  value={config.buildNumber}
                  onChange={(e) => updateConfig({ buildNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        )

      case 1: // App Configuration
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={config.description}
                onChange={(e) => updateConfig({ description: e.target.value })}
                className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
                placeholder="Describe what your app does..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={config.category}
                  onChange={(e) => updateConfig({ category: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="productivity">Productivity</option>
                  <option value="entertainment">Entertainment</option>
                  <option value="utilities">Utilities</option>
                  <option value="developer">Developer Tools</option>
                  <option value="games">Games</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Device Family
                </label>
                <select
                  value={config.deviceFamily}
                  onChange={(e) => updateConfig({ deviceFamily: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="iphone">iPhone</option>
                  <option value="ipad">iPad</option>
                  <option value="universal">Universal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min iOS Version
                </label>
                <select
                  value={config.minIOSVersion}
                  onChange={(e) => updateConfig({ minIOSVersion: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="13.0">iOS 13.0</option>
                  <option value="14.0">iOS 14.0</option>
                  <option value="15.0">iOS 15.0</option>
                  <option value="16.0">iOS 16.0</option>
                  <option value="17.0">iOS 17.0</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Orientation
                </label>
                <select
                  value={config.orientation}
                  onChange={(e) => updateConfig({ orientation: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                  <option value="all">All Orientations</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Frameworks
              </label>
              <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                {AVAILABLE_FRAMEWORKS.map(framework => (
                  <label key={framework} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.frameworks.includes(framework)}
                      onChange={() => toggleArrayItem(config.frameworks, framework, 'frameworks')}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{framework}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 2: // Permissions & Entitlements
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Permissions</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {AVAILABLE_PERMISSIONS.map(permission => (
                  <label key={permission} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.permissions.includes(permission)}
                      onChange={() => toggleArrayItem(config.permissions, permission, 'permissions')}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{permission}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">Entitlements</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {AVAILABLE_ENTITLEMENTS.map(entitlement => (
                  <label key={entitlement} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.entitlements.includes(entitlement)}
                      onChange={() => toggleArrayItem(config.entitlements, entitlement, 'entitlements')}
                      className="rounded border-gray-600 bg-gray-800 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">{entitlement}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 3: // Assets & Resources
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                App Icon
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload('icon', file)
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              {config.assets.icon && (
                <p className="text-sm text-green-400 mt-1">
                  ✓ {config.assets.icon.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Launch Screen
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload('launchScreen', file)
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              {config.assets.launchScreen && (
                <p className="text-sm text-green-400 mt-1">
                  ✓ {config.assets.launchScreen.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Additional Assets
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  files.forEach(file => addAdditionalAsset(file))
                }}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
              {config.assets.additionalAssets.length > 0 && (
                <div className="mt-2 space-y-1">
                  {config.assets.additionalAssets.map((file, index) => (
                    <p key={index} className="text-sm text-green-400">
                      ✓ {file.name}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 4: // Custom Code
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Custom Swift Code (Optional)
              </label>
              <textarea
                value={config.customCode}
                onChange={(e) => updateConfig({ customCode: e.target.value })}
                className="w-full h-64 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-blue-500 resize-none"
                placeholder={`import UIKit

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        // Your custom code here
    }
}`}
              />
            </div>
            
            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-blue-300 text-sm">
                💡 Add custom Swift code to extend your app's functionality. 
                The code will be integrated into the main view controller.
              </p>
            </div>
          </div>
        )

      case 5: // Build & Deploy
        return (
          <div className="space-y-6">
            {/* Configuration Summary */}
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3">Configuration Summary</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">App Name:</span>
                  <span className="text-white ml-2">{config.name}</span>
                </div>
                <div>
                  <span className="text-gray-400">Bundle ID:</span>
                  <span className="text-white ml-2">{config.bundleId}</span>
                </div>
                <div>
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white ml-2">{config.version}</span>
                </div>
                <div>
                  <span className="text-gray-400">Device Family:</span>
                  <span className="text-white ml-2">{config.deviceFamily}</span>
                </div>
                <div>
                  <span className="text-gray-400">Frameworks:</span>
                  <span className="text-white ml-2">{config.frameworks.length}</span>
                </div>
                <div>
                  <span className="text-gray-400">Permissions:</span>
                  <span className="text-white ml-2">{config.permissions.length}</span>
                </div>
              </div>
            </div>

            {/* Build Steps */}
            {buildSteps.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Build Progress</h3>
                {buildSteps.map(step => (
                  <div key={step.id} className="p-3 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <StatusIndicator 
                          status={
                            step.status === 'completed' ? 'success' :
                            step.status === 'error' ? 'error' :
                            step.status === 'running' ? 'loading' : 'warning'
                          }
                          message={step.status}
                          size="sm"
                        />
                        <span className="text-white font-medium">{step.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{step.progress}%</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{step.description}</p>
                    
                    {step.progress > 0 && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {step.logs.length > 0 && (
                      <div className="text-xs text-gray-400 space-y-1">
                        {step.logs.slice(-3).map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Build Button */}
            {!isBuilding && buildSteps.length === 0 && (
              <button
                onClick={buildApp}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
              >
                🚀 Build IPA for TrollStore
              </button>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={`app-wizard ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">iOS App Builder Wizard</h2>
        <p className="text-gray-300">Create custom iOS apps compatible with TrollStore</p>
        
        {freetierOptimized && (
          <div className="mt-3 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">💚</span>
              <span className="text-green-300 text-sm">Free Tier Optimized - Fast builds, no limits</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm ${
                index <= currentStep ? 'text-white' : 'text-gray-400'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-blue-600' : 'bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h3 className="text-red-400 font-medium mb-2">Please fix the following errors:</h3>
          <ul className="text-red-300 text-sm space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-8">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
        >
          Previous
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Next
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            {isBuilding && <LoadingSpinner size="sm" />}
            <span className="text-gray-300">Ready to build!</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppWizard