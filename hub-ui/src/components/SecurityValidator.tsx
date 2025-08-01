import React from 'react'

interface SecurityValidatorConfig {
  allowedOrigins: string[]
  securityLevel: 'strict' | 'moderate' | 'permissive'
  projectId: string
  maxRedirects?: number
  timeout?: number
}

interface SecurityValidationResult {
  isValid: boolean
  reason?: string
  origin: string
  timestamp: number
  securityLevel: string
}

export class SecurityValidator {
  private config: SecurityValidatorConfig
  private validationCache: Map<string, SecurityValidationResult> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  constructor(config: SecurityValidatorConfig) {
    this.config = {
      maxRedirects: 3,
      timeout: 10000,
      ...config
    }
  }

  /**
   * Validates if a URL is safe to load in an iframe
   */
  async validateUrl(url: string): Promise<boolean> {
    try {
      // Check cache first
      const cached = this.getCachedValidation(url)
      if (cached) {
        return cached.isValid
      }

      // Perform validation
      const result = await this.performValidation(url)
      
      // Cache result
      this.cacheValidation(url, result)
      
      return result.isValid
    } catch (error) {
      console.error('SecurityValidator: Validation failed', error)
      return false
    }
  }

  /**
   * Validates the origin of a message
   */
  validateMessageOrigin(origin: string): boolean {
    return this.config.allowedOrigins.some(allowedOrigin => {
      // Exact match
      if (origin === allowedOrigin) return true
      
      // Subdomain match for moderate/permissive security
      if (this.config.securityLevel !== 'strict') {
        const allowedDomain = new URL(allowedOrigin).hostname
        const originDomain = new URL(origin).hostname
        return originDomain.endsWith(`.${allowedDomain}`) || originDomain === allowedDomain
      }
      
      return false
    })
  }

  /**
   * Validates iframe content security
   */
  async validateIframeContent(iframe: HTMLIFrameElement): Promise<boolean> {
    try {
      // Check if iframe is from allowed origin
      const iframeSrc = iframe.src
      if (!await this.validateUrl(iframeSrc)) {
        return false
      }

      // Additional security checks based on security level
      switch (this.config.securityLevel) {
        case 'strict':
          return this.performStrictValidation(iframe)
        case 'moderate':
          return this.performModerateValidation(iframe)
        case 'permissive':
          return this.performPermissiveValidation(iframe)
        default:
          return false
      }
    } catch (error) {
      console.error('SecurityValidator: Iframe validation failed', error)
      return false
    }
  }

  /**
   * Sanitizes URLs to prevent XSS and other attacks
   */
  sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      
      // Only allow HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        throw new Error('Only HTTPS URLs are allowed in production')
      }
      
      // Remove dangerous parameters
      const dangerousParams = ['javascript', 'data', 'vbscript', 'onload', 'onerror']
      dangerousParams.forEach(param => {
        urlObj.searchParams.delete(param)
      })
      
      return urlObj.toString()
    } catch (error) {
      throw new Error(`Invalid URL: ${url}`)
    }
  }

  /**
   * Generates Content Security Policy for iframe
   */
  generateCSP(): string {
    const allowedOrigins = this.config.allowedOrigins.join(' ')
    
    return [
      `default-src 'self' ${allowedOrigins}`,
      `script-src 'self' 'unsafe-inline' ${allowedOrigins}`,
      `style-src 'self' 'unsafe-inline' ${allowedOrigins}`,
      `img-src 'self' data: ${allowedOrigins}`,
      `connect-src 'self' ${allowedOrigins}`,
      `frame-src 'self' ${allowedOrigins}`,
      `frame-ancestors 'self' ${allowedOrigins}`,
      "object-src 'none'",
      "base-uri 'self'"
    ].join('; ')
  }

  private async performValidation(url: string): Promise<SecurityValidationResult> {
    const startTime = Date.now()
    
    try {
      // Parse URL
      const urlObj = new URL(url)
      const origin = urlObj.origin

      // Check if origin is in allowed list
      const isOriginAllowed = this.config.allowedOrigins.includes(origin)
      if (!isOriginAllowed) {
        return {
          isValid: false,
          reason: `Origin ${origin} not in allowed origins list`,
          origin,
          timestamp: startTime,
          securityLevel: this.config.securityLevel
        }
      }

      // Perform HTTP HEAD request to check if URL is accessible
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'follow',
          mode: 'cors'
        })

        clearTimeout(timeoutId)

        // Check response status
        if (!response.ok) {
          return {
            isValid: false,
            reason: `HTTP ${response.status}: ${response.statusText}`,
            origin,
            timestamp: startTime,
            securityLevel: this.config.securityLevel
          }
        }

        // Check for security headers
        const securityHeaders = this.checkSecurityHeaders(response)
        if (this.config.securityLevel === 'strict' && !securityHeaders.isSecure) {
          return {
            isValid: false,
            reason: `Missing required security headers: ${securityHeaders.missing.join(', ')}`,
            origin,
            timestamp: startTime,
            securityLevel: this.config.securityLevel
          }
        }

        return {
          isValid: true,
          origin,
          timestamp: startTime,
          securityLevel: this.config.securityLevel
        }

      } catch (fetchError) {
        clearTimeout(timeoutId)
        
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          return {
            isValid: false,
            reason: 'Request timeout',
            origin,
            timestamp: startTime,
            securityLevel: this.config.securityLevel
          }
        }

        return {
          isValid: false,
          reason: `Network error: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
          origin,
          timestamp: startTime,
          securityLevel: this.config.securityLevel
        }
      }

    } catch (error) {
      return {
        isValid: false,
        reason: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        origin: 'unknown',
        timestamp: startTime,
        securityLevel: this.config.securityLevel
      }
    }
  }

  private checkSecurityHeaders(response: Response): { isSecure: boolean; missing: string[] } {
    const requiredHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection'
    ]

    const missing = requiredHeaders.filter(header => !response.headers.has(header))
    
    return {
      isSecure: missing.length === 0,
      missing
    }
  }

  private performStrictValidation(iframe: HTMLIFrameElement): boolean {
    // Strict validation: Check sandbox attributes, CSP, etc.
    const sandbox = iframe.getAttribute('sandbox')
    if (!sandbox) return false

    const requiredSandboxTokens = [
      'allow-scripts',
      'allow-same-origin'
    ]

    const sandboxTokens = sandbox.split(' ')
    return requiredSandboxTokens.every(token => sandboxTokens.includes(token))
  }

  private performModerateValidation(iframe: HTMLIFrameElement): boolean {
    // Moderate validation: Basic checks
    return iframe.src.startsWith('https://') || 
           (process.env.NODE_ENV === 'development' && iframe.src.startsWith('http://localhost'))
  }

  private performPermissiveValidation(iframe: HTMLIFrameElement): boolean {
    // Permissive validation: Minimal checks
    return iframe.src.length > 0 && !iframe.src.startsWith('javascript:')
  }

  private getCachedValidation(url: string): SecurityValidationResult | null {
    const cached = this.validationCache.get(url)
    if (!cached) return null

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.validationCache.delete(url)
      return null
    }

    return cached
  }

  private cacheValidation(url: string, result: SecurityValidationResult): void {
    this.validationCache.set(url, result)
    
    // Clean up old cache entries
    if (this.validationCache.size > 100) {
      const oldestKey = this.validationCache.keys().next().value
      this.validationCache.delete(oldestKey)
    }
  }

  /**
   * Clear validation cache
   */
  clearCache(): void {
    this.validationCache.clear()
  }

  /**
   * Get validation statistics
   */
  getStats(): { cacheSize: number; cacheHitRate: number } {
    return {
      cacheSize: this.validationCache.size,
      cacheHitRate: 0 // TODO: Implement hit rate tracking
    }
  }
}

// React component for displaying security status
interface SecurityStatusProps {
  validator: SecurityValidator
  url: string
  className?: string
}

export const SecurityStatus: React.FC<SecurityStatusProps> = ({ 
  validator, 
  url, 
  className = '' 
}) => {
  const [status, setStatus] = React.useState<'checking' | 'valid' | 'invalid'>('checking')
  const [message, setMessage] = React.useState<string>('')

  React.useEffect(() => {
    const checkSecurity = async () => {
      setStatus('checking')
      try {
        const isValid = await validator.validateUrl(url)
        setStatus(isValid ? 'valid' : 'invalid')
        setMessage(isValid ? 'Security validation passed' : 'Security validation failed')
      } catch (error) {
        setStatus('invalid')
        setMessage(`Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    checkSecurity()
  }, [validator, url])

  const getStatusIcon = () => {
    switch (status) {
      case 'checking': return '🔍'
      case 'valid': return '🔒'
      case 'invalid': return '⚠️'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return 'text-yellow-400'
      case 'valid': return 'text-green-400'
      case 'invalid': return 'text-red-400'
    }
  }

  return (
    <div className={`security-status flex items-center space-x-2 ${className}`}>
      <span className="text-lg">{getStatusIcon()}</span>
      <span className={`text-sm ${getStatusColor()}`}>
        {message}
      </span>
    </div>
  )
}

export default SecurityValidator