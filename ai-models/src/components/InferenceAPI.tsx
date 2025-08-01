import React, { useState, useEffect, useCallback, useRef } from 'react'
import { LoadingSpinner } from '@shared/components/LoadingSpinner'
import { StatusIndicator } from '@shared/components/StatusIndicator'

interface InferenceRequest {
  id: string
  prompt: string
  model: string
  parameters: {
    maxTokens: number
    temperature: number
    topP: number
    topK: number
    repeatPenalty: number
  }
  timestamp: number
  status: 'pending' | 'processing' | 'completed' | 'error'
  response?: string
  error?: string
  processingTime?: number
}

interface InferenceAPIProps {
  className?: string
  selectedModel?: string
  onResponse?: (response: string, request: InferenceRequest) => void
  onError?: (error: Error, request: InferenceRequest) => void
  freetierOptimized?: boolean
  maxConcurrentRequests?: number
}

interface ModelParameters {
  maxTokens: { min: number; max: number; default: number }
  temperature: { min: number; max: number; default: number }
  topP: { min: number; max: number; default: number }
  topK: { min: number; max: number; default: number }
  repeatPenalty: { min: number; max: number; default: number }
}

const MODEL_PARAMETERS: Record<string, ModelParameters> = {
  'mistral-7b': {
    maxTokens: { min: 1, max: 4096, default: 512 },
    temperature: { min: 0.1, max: 2.0, default: 0.7 },
    topP: { min: 0.1, max: 1.0, default: 0.9 },
    topK: { min: 1, max: 100, default: 40 },
    repeatPenalty: { min: 1.0, max: 1.5, default: 1.1 }
  },
  'tinyllama': {
    maxTokens: { min: 1, max: 2048, default: 256 },
    temperature: { min: 0.1, max: 2.0, default: 0.8 },
    topP: { min: 0.1, max: 1.0, default: 0.95 },
    topK: { min: 1, max: 50, default: 20 },
    repeatPenalty: { min: 1.0, max: 1.3, default: 1.05 }
  },
  'phi-2': {
    maxTokens: { min: 1, max: 2048, default: 512 },
    temperature: { min: 0.1, max: 1.5, default: 0.3 },
    topP: { min: 0.1, max: 1.0, default: 0.85 },
    topK: { min: 1, max: 80, default: 30 },
    repeatPenalty: { min: 1.0, max: 1.4, default: 1.1 }
  },
  'codellama': {
    maxTokens: { min: 1, max: 4096, default: 1024 },
    temperature: { min: 0.1, max: 1.0, default: 0.2 },
    topP: { min: 0.1, max: 1.0, default: 0.8 },
    topK: { min: 1, max: 60, default: 25 },
    repeatPenalty: { min: 1.0, max: 1.3, default: 1.05 }
  }
}

export const InferenceAPI: React.FC<InferenceAPIProps> = ({
  className = '',
  selectedModel = 'tinyllama',
  onResponse,
  onError,
  freetierOptimized = true,
  maxConcurrentRequests = 1
}) => {
  const [prompt, setPrompt] = useState('')
  const [parameters, setParameters] = useState(MODEL_PARAMETERS[selectedModel] || MODEL_PARAMETERS['tinyllama'])
  const [currentParams, setCurrentParams] = useState({
    maxTokens: parameters.maxTokens.default,
    temperature: parameters.temperature.default,
    topP: parameters.topP.default,
    topK: parameters.topK.default,
    repeatPenalty: parameters.repeatPenalty.default
  })
  const [requests, setRequests] = useState<InferenceRequest[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')
  const [requestQueue, setRequestQueue] = useState<InferenceRequest[]>([])
  
  const requestIdCounter = useRef(0)
  const abortController = useRef<AbortController | null>(null)

  // Update parameters when model changes
  useEffect(() => {
    const modelParams = MODEL_PARAMETERS[selectedModel] || MODEL_PARAMETERS['tinyllama']
    setParameters(modelParams)
    setCurrentParams({
      maxTokens: modelParams.maxTokens.default,
      temperature: modelParams.temperature.default,
      topP: modelParams.topP.default,
      topK: modelParams.topK.default,
      repeatPenalty: modelParams.repeatPenalty.default
    })
  }, [selectedModel])

  // Process request queue
  useEffect(() => {
    const processQueue = async () => {
      if (isProcessing || requestQueue.length === 0) return

      const activeRequests = requests.filter(r => r.status === 'processing').length
      if (activeRequests >= maxConcurrentRequests) return

      const nextRequest = requestQueue[0]
      setRequestQueue(prev => prev.slice(1))
      
      await processInferenceRequest(nextRequest)
    }

    processQueue()
  }, [requestQueue, isProcessing, requests, maxConcurrentRequests])

  // Generate inference request
  const generateRequest = useCallback((): InferenceRequest => {
    return {
      id: `req_${++requestIdCounter.current}_${Date.now()}`,
      prompt: prompt.trim(),
      model: selectedModel,
      parameters: { ...currentParams },
      timestamp: Date.now(),
      status: 'pending'
    }
  }, [prompt, selectedModel, currentParams])

  // Simulate AI inference (in real implementation, this would call actual AI model)
  const simulateInference = async (request: InferenceRequest, onStream?: (chunk: string) => void): Promise<string> => {
    const { prompt, parameters } = request
    
    // Simulate processing time based on model and parameters
    const baseTime = selectedModel === 'tinyllama' ? 500 : selectedModel === 'phi-2' ? 1000 : 2000
    const tokenTime = parameters.maxTokens * (selectedModel === 'tinyllama' ? 20 : 50)
    const totalTime = baseTime + tokenTime

    // Simulate streaming response
    const words = [
      'I understand your request.',
      'Let me process this information.',
      'Based on the context provided,',
      'here is my response:',
      'This is a simulated AI response',
      'generated by the Multi-Hub platform.',
      'The response demonstrates the inference capabilities',
      'of the selected AI model.',
      'Parameters used:',
      `Temperature: ${parameters.temperature},`,
      `Max tokens: ${parameters.maxTokens},`,
      `Model: ${request.model}.`,
      'This system is optimized for free tier usage',
      'with no rate limits for personal use.',
      'Thank you for using Multi-Hub AI!'
    ]

    let response = ''
    const chunkDelay = totalTime / words.length

    for (let i = 0; i < Math.min(words.length, Math.floor(parameters.maxTokens / 5)); i++) {
      if (abortController.current?.signal.aborted) {
        throw new Error('Request aborted')
      }

      await new Promise(resolve => setTimeout(resolve, chunkDelay))
      
      const chunk = words[i] + ' '
      response += chunk
      onStream?.(chunk)
    }

    return response.trim()
  }

  // Process inference request
  const processInferenceRequest = async (request: InferenceRequest) => {
    setIsProcessing(true)
    setStreamingResponse('')
    
    // Update request status
    setRequests(prev => prev.map(r => 
      r.id === request.id ? { ...r, status: 'processing' } : r
    ))

    const startTime = Date.now()

    try {
      abortController.current = new AbortController()

      const response = await simulateInference(request, (chunk) => {
        setStreamingResponse(prev => prev + chunk)
      })

      const processingTime = Date.now() - startTime

      // Update request with response
      const completedRequest = {
        ...request,
        status: 'completed' as const,
        response,
        processingTime
      }

      setRequests(prev => prev.map(r => 
        r.id === request.id ? completedRequest : r
      ))

      onResponse?.(response, completedRequest)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      const errorRequest = {
        ...request,
        status: 'error' as const,
        error: errorMessage,
        processingTime: Date.now() - startTime
      }

      setRequests(prev => prev.map(r => 
        r.id === request.id ? errorRequest : r
      ))

      onError?.(error instanceof Error ? error : new Error(errorMessage), errorRequest)

    } finally {
      setIsProcessing(false)
      setStreamingResponse('')
      abortController.current = null
    }
  }

  // Submit inference request
  const submitRequest = useCallback(async () => {
    if (!prompt.trim() || !selectedModel) return

    const request = generateRequest()
    
    // Add to requests list
    setRequests(prev => [request, ...prev])

    // Add to queue or process immediately
    if (freetierOptimized) {
      // For free tier, process one at a time
      setRequestQueue(prev => [...prev, request])
    } else {
      await processInferenceRequest(request)
    }

    // Clear prompt for next request
    setPrompt('')
  }, [prompt, selectedModel, generateRequest, freetierOptimized])

  // Cancel current request
  const cancelRequest = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
    }
  }, [])

  // Clear all requests
  const clearRequests = useCallback(() => {
    setRequests([])
    setRequestQueue([])
    setStreamingResponse('')
  }, [])

  // Parameter update handler
  const updateParameter = useCallback((param: string, value: number) => {
    setCurrentParams(prev => ({ ...prev, [param]: value }))
  }, [])

  // Get parameter slider props
  const getSliderProps = (param: keyof ModelParameters) => {
    const paramConfig = parameters[param]
    return {
      min: paramConfig.min,
      max: paramConfig.max,
      step: param === 'maxTokens' || param === 'topK' ? 1 : 0.1,
      value: currentParams[param],
      onChange: (value: number) => updateParameter(param, value)
    }
  }

  return (
    <div className={`inference-api ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">AI Inference API</h2>
        <p className="text-gray-300">Generate AI responses using the selected model</p>
        
        <div className="mt-3 flex items-center space-x-4">
          <StatusIndicator 
            status={selectedModel ? 'success' : 'warning'}
            message={selectedModel ? `Model: ${selectedModel}` : 'No model selected'}
            size="sm"
          />
          
          {freetierOptimized && (
            <div className="flex items-center space-x-2">
              <span className="text-green-400">💚</span>
              <span className="text-green-300 text-sm">Free Tier Optimized</span>
            </div>
          )}
        </div>
      </div>

      {/* Input Section */}
      <div className="mb-6 space-y-4">
        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
            disabled={isProcessing}
          />
        </div>

        {/* Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(parameters).map(([param, config]) => (
            <div key={param}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {param.charAt(0).toUpperCase() + param.slice(1).replace(/([A-Z])/g, ' $1')}
                <span className="text-blue-400 ml-2">{currentParams[param as keyof typeof currentParams]}</span>
              </label>
              <input
                type="range"
                {...getSliderProps(param as keyof ModelParameters)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                disabled={isProcessing}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>{config.min}</span>
                <span>{config.max}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            onClick={submitRequest}
            disabled={!prompt.trim() || !selectedModel || isProcessing}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner size="sm" />
                <span>Processing...</span>
              </div>
            ) : (
              'Generate Response'
            )}
          </button>
          
          {isProcessing && (
            <button
              onClick={cancelRequest}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          )}
          
          <button
            onClick={clearRequests}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Streaming Response */}
      {streamingResponse && (
        <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Streaming Response</h3>
          <div className="text-white whitespace-pre-wrap font-mono text-sm">
            {streamingResponse}
            <span className="animate-pulse">|</span>
          </div>
        </div>
      )}

      {/* Request Queue Status */}
      {requestQueue.length > 0 && (
        <div className="mb-6 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span className="text-yellow-300">
              {requestQueue.length} request{requestQueue.length !== 1 ? 's' : ''} in queue
            </span>
          </div>
        </div>
      )}

      {/* Request History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Request History</h3>
        
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No requests yet. Submit a prompt to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(request => (
              <div 
                key={request.id}
                className="p-4 bg-gray-800 border border-gray-600 rounded-lg"
              >
                {/* Request Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIndicator 
                      status={
                        request.status === 'completed' ? 'success' :
                        request.status === 'error' ? 'error' :
                        'loading'
                      }
                      message={request.status}
                      size="sm"
                    />
                    <span className="text-gray-400 text-sm">
                      {new Date(request.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-blue-400 text-sm">{request.model}</span>
                  </div>
                  
                  {request.processingTime && (
                    <span className="text-gray-400 text-sm">
                      {request.processingTime}ms
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="mb-3">
                  <div className="text-sm font-medium text-gray-300 mb-1">Prompt:</div>
                  <div className="text-gray-100 text-sm bg-gray-900 p-2 rounded">
                    {request.prompt}
                  </div>
                </div>

                {/* Response */}
                {request.response && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-300 mb-1">Response:</div>
                    <div className="text-gray-100 text-sm bg-gray-900 p-2 rounded whitespace-pre-wrap">
                      {request.response}
                    </div>
                  </div>
                )}

                {/* Error */}
                {request.error && (
                  <div className="mb-3">
                    <div className="text-sm font-medium text-red-400 mb-1">Error:</div>
                    <div className="text-red-300 text-sm bg-red-900/20 p-2 rounded">
                      {request.error}
                    </div>
                  </div>
                )}

                {/* Parameters */}
                <div className="text-xs text-gray-400">
                  Parameters: max_tokens={request.parameters.maxTokens}, 
                  temperature={request.parameters.temperature}, 
                  top_p={request.parameters.topP}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default InferenceAPI