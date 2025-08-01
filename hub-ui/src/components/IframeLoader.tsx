IKKE DOWNimport React, { useEffect, useRef, useState, useCallback } from 'react'
import { SecurityValidator } from './SecurityValidator'
import { LoadingSpinner } from './common/LoadingSpinner'
import { StatusIndicator } from './common/StatusIndicator'

interface IframeLoaderProps {
  src: string
  title: string
  projectId: string
  onLoad?: () => void
  onError?: (error: Error) => void
  className?: string
  allowedOrigins?: string[]
  securityLevel?: 'strict' | 'moderate' | 'permissive'
}

interface IframeMessage {
  type: string
  payload: any
  origin: string
  timestamp: number
}

export const IframeLoader: React.FC<IframeLoaderProps> = ({
  src,
  title,
  projectId,
  onLoad,
  onError,
  className = '',
  allowedOrigins = [],
  securityLevel = 'strict'
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [securityStatus, setSecurityStatus] = useState<'validating' | 'approved' | 'rejected'>('validating')
  const [loadProgress, setLoadProgress] = useState(0)
  const messageQueueRef = useRef<IframeMessage[]>([])

  // Security validation
  const validateSecurity = useCallback(async (url: string): Promise<boolean> => {
    try {
      const validator = new SecurityValidator({
        allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : [
          'https://alot1z-hub-ui.netlify.app',
          'https://alot1z-ipa-builder.netlify.app',
          'https://alot1z-printer-builder.netlify.app',
          'https://alot1z-game-builder.netlify.app',
          'https://alot1z-ai-models.netlify.app'
        ],
        securityLevel,
        projectId
      })

      const isValid = await validator.validateUrl(url)
      setSecurityStatus(isValid ? 'approved' : 'rejected')
      
      if (!isValid) {
        setIsError(true)
        setErrorMessage('Security validation failed: URL not in allowed origins')
        onError?.(new Error('Security validation failed'))
      }
      
      return isValid
    } catch (error) {
      setSecurityStatus('rejected')
      setIsError(true)
      setErrorMessage(`Security validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      onError?.(error instanceof Error ? error : new Error('Security validation failed'))
      return false
    }
  }, [allowedOrigins, securityLevel, projectId, onError])

  // Message handling for cross-origin communication
  const handleMessage = useCallback((event: MessageEvent) => {
    // Validate message origin
    const allowedOriginsList = allowedOrigins.length > 0 ? allowedOrigins : [
      'https://alot1z-hub-ui.netlify.app',
      'https://alot1z-ipa-builder.netlify.app',
      'https://alot1z-printer-builder.netlify.app',
      'https://alot1z-game-builder.netlify.app',
      'https://alot1z-ai-models.netlify.app'
    ]

    const isOriginAllowed = allowedOriginsList.some(origin => 
      event.origin === origin || event.origin.startsWith(origin)
    )

    if (!isOriginAllowed) {
      console.warn(`IframeLoader: Rejected message from unauthorized origin: ${event.origin}`)
      return
    }

    const message: IframeMessage = {
      type: event.data.type || 'unknown',
      payload: event.data.payload || event.data,
      origin: event.origin,
      timestamp: Date.now()
    }

    // Handle specific message types
    switch (message.type) {
      case 'iframe-ready':
        setIsLoading(false)
        setLoadProgress(100)
        onLoad?.()
        break
      
      case 'iframe-error':
        setIsError(true)
        setErrorMessage(message.payload.message || 'Iframe reported an error')
        onError?.(new Error(message.payload.message))
        break
      
      case 'load-progress':
        setLoadProgress(Math.min(100, Math.max(0, message.payload.progress || 0)))
        break
      
      case 'security-check':
        // Respond to security check from iframe
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'security-response',
            payload: {
              projectId,
              timestamp: Date.now(),
              approved: securityStatus === 'approved'
            }
          }, event.origin)
        }
        break
      
      default:
        // Queue unknown messages for potential handling by parent components
        messageQueueRef.current.push(message)
        // Keep only last 50 messages to prevent memory leaks
        if (messageQueueRef.current.length > 50) {
          messageQueueRef.current = messageQueueRef.current.slice(-50)
        }
    }
  }, [allowedOrigins, projectId, securityStatus, onLoad, onError])

  // Setup message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Initialize security validation
  useEffect(() => {
    validateSecurity(src)
  }, [src, validateSecurity])

  // Iframe load handler
  const handleIframeLoad = useCallback(() => {
    if (securityStatus === 'approved') {
      // Send initial handshake message
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'parent-ready',
          payload: {
            projectId,
            timestamp: Date.now(),
            parentOrigin: window.location.origin
          }
        }, new URL(src).origin)
      }
      
      // Set a timeout to mark as loaded if no response
      setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setLoadProgress(100)
          onLoad?.()
        }
      }, 3000)
    }
  }, [securityStatus, projectId, src, isLoading, onLoad])

  // Iframe error handler
  const handleIframeError = useCallback(() => {
    setIsError(true)
    setIsLoading(false)
    setErrorMessage('Failed to load iframe content')
    onError?.(new Error('Iframe failed to load'))
  }, [onError])

  // Retry mechanism
  const handleRetry = useCallback(() => {
    setIsError(false)
    setIsLoading(true)
    setErrorMessage('')
    setLoadProgress(0)
    setSecurityStatus('validating')
    validateSecurity(src)
  }, [src, validateSecurity])

  // Render security validation state
  if (securityStatus === 'validating') {
    return (
      <div className={`iframe-loader-container ${className}`}>
        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-300">Validating security...</p>
            <StatusIndicator status="loading" message="Security check in progress" />
          </div>
        </div>
      </div>
    )
  }

  // Render security rejection state
  if (securityStatus === 'rejected') {
    return (
      <div className={`iframe-loader-container ${className}`}>
        <div className="flex items-center justify-center h-64 bg-red-900/20 border border-red-500 rounded-lg">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">🚫</div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Security Validation Failed</h3>
            <p className="text-gray-300 mb-4">{errorMessage}</p>
            <StatusIndicator status="error" message="Access denied for security reasons" />
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry Validation
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (isError) {
    return (
      <div className={`iframe-loader-container ${className}`}>
        <div className="flex items-center justify-center h-64 bg-red-900/20 border border-red-500 rounded-lg">
          <div className="text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Loading Error</h3>
            <p className="text-gray-300 mb-4">{errorMessage}</p>
            <StatusIndicator status="error" message={errorMessage} />
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`iframe-loader-container relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-300">Loading {title}...</p>
            <div className="mt-2 w-64 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-gray-400">{loadProgress}%</p>
            <StatusIndicator status="loading" message={`Loading ${title}`} />
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        className="w-full h-full border-0 rounded-lg"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        allow="accelerometer; autoplay; camera; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; usb; web-share"
        loading="lazy"
        style={{ minHeight: '600px' }}
      />

      {/* Security indicator */}
      <div className="absolute top-2 right-2 z-20">
        <StatusIndicator 
          status={securityStatus === 'approved' ? 'success' : 'loading'} 
          message={securityStatus === 'approved' ? 'Secure connection' : 'Validating security'}
          size="sm"
        />
      </div>
    </div>
  )
}

// Export message queue accessor for parent components
export const useIframeMessages = () => {
  return {
    getMessages: () => messageQueueRef.current,
    clearMessages: () => { messageQueueRef.current = [] }
  }
}