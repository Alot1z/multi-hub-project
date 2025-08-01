import React, { useState, useEffect, useCallback } from 'react'
import { LoadingSpinner } from '@shared/components/LoadingSpinner'
import { StatusIndicator } from '@shared/components/StatusIndicator'

interface AIModel {
  id: string
  name: string
  type: 'instruction' | 'chat' | 'reasoning' | 'code'
  size: string
  status: 'available' | 'loading' | 'loaded' | 'error'
  path: string
  useCases: string[]
  performance: {
    tokensPerSecond: number
    memoryUsage: string
    cpuUsage: number
  }
  lastUsed?: number
}

interface ModelManagerProps {
  className?: string
  onModelSelect?: (model: AIModel) => void
  onModelLoad?: (model: AIModel) => void
  onError?: (error: Error) => void
  freetierOptimized?: boolean
}

const AVAILABLE_MODELS: AIModel[] = [
  {
    id: 'mistral-7b',
    name: 'Mistral 7B',
    type: 'instruction',
    size: '4.1GB',
    status: 'available',
    path: 'models/ai/mistral-7b.gguf',
    useCases: ['general', 'reasoning', 'planning'],
    performance: {
      tokensPerSecond: 15,
      memoryUsage: '4.5GB',
      cpuUsage: 60
    }
  },
  {
    id: 'tinyllama',
    name: 'TinyLLaMA',
    type: 'chat',
    size: '637MB',
    status: 'available',
    path: 'models/ai/tinyllama.gguf',
    useCases: ['quick', 'simple', 'fallback'],
    performance: {
      tokensPerSecond: 45,
      memoryUsage: '800MB',
      cpuUsage: 25
    }
  },
  {
    id: 'phi-2',
    name: 'Phi-2',
    type: 'reasoning',
    size: '1.6GB',
    status: 'available',
    path: 'models/ai/phi-2.gguf',
    useCases: ['math', 'logic', 'analysis'],
    performance: {
      tokensPerSecond: 30,
      memoryUsage: '2.1GB',
      cpuUsage: 45
    }
  },
  {
    id: 'codellama',
    name: 'CodeLlama',
    type: 'code',
    size: '3.8GB',
    status: 'available',
    path: 'models/ai/codellama.gguf',
    useCases: ['programming', 'debugging', 'generation'],
    performance: {
      tokensPerSecond: 20,
      memoryUsage: '4.2GB',
      cpuUsage: 55
    }
  }
]

export const ModelManager: React.FC<ModelManagerProps> = ({
  className = '',
  onModelSelect,
  onModelLoad,
  onError,
  freetierOptimized = true
}) => {
  const [models, setModels] = useState<AIModel[]>(AVAILABLE_MODELS)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const [loadingModel, setLoadingModel] = useState<string | null>(null)
  const [systemResources, setSystemResources] = useState({
    availableMemory: '8GB',
    cpuCores: 4,
    gpuAvailable: false
  })

  // Monitor system resources
  useEffect(() => {
    const checkResources = () => {
      // Simulate resource checking - in real implementation would use system APIs
      const memoryInfo = (navigator as any).deviceMemory || 8
      setSystemResources({
        availableMemory: `${memoryInfo}GB`,
        cpuCores: navigator.hardwareConcurrency || 4,
        gpuAvailable: false // For free tier, assume no GPU
      })
    }

    checkResources()
    const interval = setInterval(checkResources, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  // Load model
  const loadModel = useCallback(async (model: AIModel) => {
    if (loadingModel) return

    setLoadingModel(model.id)
    
    try {
      // Update model status
      setModels(prev => prev.map(m => 
        m.id === model.id ? { ...m, status: 'loading' } : m
      ))

      // Simulate model loading - in real implementation would load actual model
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Check if model fits in available memory (free tier optimization)
      const modelSizeGB = parseFloat(model.size.replace('GB', '').replace('MB', '')) / (model.size.includes('MB') ? 1000 : 1)
      const availableMemoryGB = parseFloat(systemResources.availableMemory.replace('GB', ''))
      
      if (freetierOptimized && modelSizeGB > availableMemoryGB * 0.7) {
        throw new Error(`Model too large for available memory. Model: ${model.size}, Available: ${systemResources.availableMemory}`)
      }

      // Mark model as loaded
      setModels(prev => prev.map(m => 
        m.id === model.id 
          ? { ...m, status: 'loaded', lastUsed: Date.now() }
          : { ...m, status: m.status === 'loaded' ? 'available' : m.status } // Unload other models for free tier
      ))

      setSelectedModel(model)
      onModelLoad?.(model)

    } catch (error) {
      setModels(prev => prev.map(m => 
        m.id === model.id ? { ...m, status: 'error' } : m
      ))
      
      const errorObj = error instanceof Error ? error : new Error('Failed to load model')
      onError?.(errorObj)
    } finally {
      setLoadingModel(null)
    }
  }, [loadingModel, systemResources, freetierOptimized, onModelLoad, onError])

  // Unload model
  const unloadModel = useCallback((modelId: string) => {
    setModels(prev => prev.map(m => 
      m.id === modelId ? { ...m, status: 'available' } : m
    ))
    
    if (selectedModel?.id === modelId) {
      setSelectedModel(null)
    }
  }, [selectedModel])

  // Select model
  const selectModel = useCallback((model: AIModel) => {
    setSelectedModel(model)
    onModelSelect?.(model)
  }, [onModelSelect])

  // Get recommended model for free tier
  const getRecommendedModel = useCallback(() => {
    if (!freetierOptimized) return models[0]
    
    // For free tier, recommend smallest model that's still capable
    return models.find(m => m.id === 'tinyllama') || models[0]
  }, [models, freetierOptimized])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'loaded': return 'text-green-400'
      case 'loading': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'instruction': return 'bg-blue-500/20 text-blue-400'
      case 'chat': return 'bg-green-500/20 text-green-400'
      case 'reasoning': return 'bg-purple-500/20 text-purple-400'
      case 'code': return 'bg-orange-500/20 text-orange-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className={`model-manager ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">AI Model Manager</h2>
        <p className="text-gray-300">Manage and switch between AI models for your Multi-Hub platform</p>
        
        {freetierOptimized && (
          <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-blue-400">💡</span>
              <span className="text-blue-300 text-sm">Free Tier Optimized - Models auto-managed for optimal performance</span>
            </div>
          </div>
        )}
      </div>

      {/* System Resources */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-3">System Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{systemResources.availableMemory}</div>
            <div className="text-sm text-gray-400">Available Memory</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{systemResources.cpuCores}</div>
            <div className="text-sm text-gray-400">CPU Cores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {systemResources.gpuAvailable ? 'Yes' : 'No'}
            </div>
            <div className="text-sm text-gray-400">GPU Available</div>
          </div>
        </div>
      </div>

      {/* Currently Selected Model */}
      {selectedModel && (
        <div className="mb-6 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-400">Currently Selected</h3>
              <p className="text-white">{selectedModel.name}</p>
              <p className="text-gray-300 text-sm">{selectedModel.useCases.join(', ')}</p>
            </div>
            <StatusIndicator 
              status={selectedModel.status === 'loaded' ? 'success' : 'loading'}
              message={selectedModel.status === 'loaded' ? 'Ready' : 'Loading...'}
            />
          </div>
        </div>
      )}

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map(model => (
          <div 
            key={model.id}
            className={`model-card p-4 bg-gray-800 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-700 ${
              selectedModel?.id === model.id ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600'
            }`}
            onClick={() => selectModel(model)}
          >
            {/* Model Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(model.type)}`}>
                  {model.type}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getStatusColor(model.status)}`}>
                  {model.status}
                </div>
                <div className="text-xs text-gray-400">{model.size}</div>
              </div>
            </div>

            {/* Use Cases */}
            <div className="mb-3">
              <div className="text-sm text-gray-400 mb-1">Use Cases:</div>
              <div className="flex flex-wrap gap-1">
                {model.useCases.map(useCase => (
                  <span 
                    key={useCase}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Performance:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className="text-white font-medium">{model.performance.tokensPerSecond}</div>
                  <div className="text-gray-400">tok/s</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium">{model.performance.memoryUsage}</div>
                  <div className="text-gray-400">memory</div>
                </div>
                <div className="text-center">
                  <div className="text-white font-medium">{model.performance.cpuUsage}%</div>
                  <div className="text-gray-400">CPU</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              {model.status === 'available' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    loadModel(model)
                  }}
                  disabled={loadingModel !== null}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
                >
                  {loadingModel === model.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load Model'
                  )}
                </button>
              )}
              
              {model.status === 'loaded' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    unloadModel(model.id)
                  }}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  Unload
                </button>
              )}
              
              {model.status === 'error' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    loadModel(model)
                  }}
                  className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  Retry
                </button>
              )}
            </div>

            {/* Last Used */}
            {model.lastUsed && (
              <div className="mt-2 text-xs text-gray-400">
                Last used: {new Date(model.lastUsed).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Free Tier Recommendations */}
      {freetierOptimized && (
        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">Free Tier Recommendations</h3>
          <div className="text-gray-300 text-sm space-y-2">
            <p>• Start with <strong>{getRecommendedModel().name}</strong> for optimal performance</p>
            <p>• Only one model can be loaded at a time to conserve memory</p>
            <p>• Models automatically unload when switching to prevent memory issues</p>
            <p>• Use TinyLLaMA for quick tasks, upgrade to larger models when needed</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelManager