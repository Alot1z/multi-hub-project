import { SecurityValidator } from '../components/SecurityValidator'

export interface IframeInstance {
  id: string
  element: HTMLIFrameElement
  src: string
  projectId: string
  status: 'loading' | 'loaded' | 'error' | 'destroyed'
  createdAt: number
  lastActivity: number
  messageQueue: IframeMessage[]
  securityValidator: SecurityValidator
}

export interface IframeMessage {
  id: string
  type: string
  payload: any
  origin: string
  timestamp: number
  direction: 'incoming' | 'outgoing'
  iframeId: string
}

export interface IframeManagerConfig {
  maxInstances: number
  messageQueueSize: number
  inactivityTimeout: number
  securityLevel: 'strict' | 'moderate' | 'permissive'
  allowedOrigins: string[]
  enableLogging: boolean
}

export interface IframeLifecycleEvents {
  onLoad?: (iframe: IframeInstance) => void
  onError?: (iframe: IframeInstance, error: Error) => void
  onMessage?: (iframe: IframeInstance, message: IframeMessage) => void
  onDestroy?: (iframe: IframeInstance) => void
  onSecurityViolation?: (iframe: IframeInstance, violation: SecurityViolation) => void
}

export interface SecurityViolation {
  type: 'unauthorized_origin' | 'invalid_message' | 'security_check_failed'
  details: string
  timestamp: number
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class IframeManager {
  private instances: Map<string, IframeInstance> = new Map()
  private messageHandlers: Map<string, (message: IframeMessage) => void> = new Map()
  private config: IframeManagerConfig
  private events: IframeLifecycleEvents
  private cleanupInterval: NodeJS.Timeout | null = null
  private messageIdCounter = 0

  constructor(config: Partial<IframeManagerConfig> = {}, events: IframeLifecycleEvents = {}) {
    this.config = {
      maxInstances: 10,
      messageQueueSize: 100,
      inactivityTimeout: 30 * 60 * 1000, // 30 minutes
      securityLevel: 'strict',
      allowedOrigins: [],
      enableLogging: process.env.NODE_ENV === 'development',
      ...config
    }
    
    this.events = events
    this.initializeMessageListener()
    this.startCleanupTimer()
  }

  /**
   * Creates a new iframe instance
   */
  async createIframe(
    src: string, 
    projectId: string, 
    container: HTMLElement,
    options: Partial<{
      title: string
      className: string
      sandbox: string
      allow: string
      securityLevel: 'strict' | 'moderate' | 'permissive'
    }> = {}
  ): Promise<IframeInstance> {
    // Check instance limit
    if (this.instances.size >= this.config.maxInstances) {
      await this.cleanupOldestInstance()
    }

    // Generate unique ID
    const id = this.generateIframeId(projectId)

    // Create security validator
    const securityValidator = new SecurityValidator({
      allowedOrigins: this.config.allowedOrigins,
      securityLevel: options.securityLevel || this.config.securityLevel,
      projectId
    })

    // Validate URL before creating iframe
    const isValidUrl = await securityValidator.validateUrl(src)
    if (!isValidUrl) {
      throw new Error(`Security validation failed for URL: ${src}`)
    }

    // Create iframe element
    const iframe = document.createElement('iframe')
    iframe.id = id
    iframe.src = securityValidator.sanitizeUrl(src)
    iframe.title = options.title || `${projectId} Builder`
    iframe.className = options.className || 'w-full h-full border-0'
    iframe.sandbox = options.sandbox || 'allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox'
    iframe.allow = options.allow || 'accelerometer; autoplay; camera; encrypted-media; fullscreen; geolocation; gyroscope; magnetometer; microphone; midi; payment; picture-in-picture; usb; web-share'
    iframe.loading = 'lazy'

    // Set CSP if supported
    if ('csp' in iframe) {
      (iframe as any).csp = securityValidator.generateCSP()
    }

    // Create iframe instance
    const instance: IframeInstance = {
      id,
      element: iframe,
      src,
      projectId,
      status: 'loading',
      createdAt: Date.now(),
      lastActivity: Date.now(),
      messageQueue: [],
      securityValidator
    }

    // Setup event listeners
    this.setupIframeEventListeners(instance)

    // Add to container
    container.appendChild(iframe)

    // Store instance
    this.instances.set(id, instance)

    this.log(`Created iframe instance: ${id} for project: ${projectId}`)

    return instance
  }

  /**
   * Destroys an iframe instance
   */
  destroyIframe(id: string): boolean {
    const instance = this.instances.get(id)
    if (!instance) return false

    // Remove from DOM
    if (instance.element.parentNode) {
      instance.element.parentNode.removeChild(instance.element)
    }

    // Update status
    instance.status = 'destroyed'

    // Clear message queue
    instance.messageQueue = []

    // Remove from instances
    this.instances.delete(id)

    // Trigger event
    this.events.onDestroy?.(instance)

    this.log(`Destroyed iframe instance: ${id}`)

    return true
  }

  /**
   * Sends a message to an iframe
   */
  sendMessage(iframeId: string, type: string, payload: any): Promise<boolean> {
    return new Promise((resolve) => {
      const instance = this.instances.get(iframeId)
      if (!instance || instance.status !== 'loaded') {
        resolve(false)
        return
      }

      try {
        const message = {
          id: this.generateMessageId(),
          type,
          payload,
          origin: window.location.origin,
          timestamp: Date.now(),
          direction: 'outgoing' as const,
          iframeId
        }

        // Send message to iframe
        instance.element.contentWindow?.postMessage({
          type,
          payload,
          messageId: message.id,
          timestamp: message.timestamp
        }, new URL(instance.src).origin)

        // Add to message queue
        this.addToMessageQueue(instance, message)

        // Update activity
        instance.lastActivity = Date.now()

        this.log(`Sent message to iframe ${iframeId}:`, message)

        resolve(true)
      } catch (error) {
        this.log(`Failed to send message to iframe ${iframeId}:`, error)
        resolve(false)
      }
    })
  }

  /**
   * Gets an iframe instance by ID
   */
  getInstance(id: string): IframeInstance | undefined {
    return this.instances.get(id)
  }

  /**
   * Gets all iframe instances
   */
  getAllInstances(): IframeInstance[] {
    return Array.from(this.instances.values())
  }

  /**
   * Gets instances by project ID
   */
  getInstancesByProject(projectId: string): IframeInstance[] {
    return Array.from(this.instances.values()).filter(
      instance => instance.projectId === projectId
    )
  }

  /**
   * Registers a message handler for a specific message type
   */
  registerMessageHandler(type: string, handler: (message: IframeMessage) => void): void {
    this.messageHandlers.set(type, handler)
  }

  /**
   * Unregisters a message handler
   */
  unregisterMessageHandler(type: string): void {
    this.messageHandlers.delete(type)
  }

  /**
   * Gets message history for an iframe
   */
  getMessageHistory(iframeId: string): IframeMessage[] {
    const instance = this.instances.get(iframeId)
    return instance ? [...instance.messageQueue] : []
  }

  /**
   * Clears message history for an iframe
   */
  clearMessageHistory(iframeId: string): void {
    const instance = this.instances.get(iframeId)
    if (instance) {
      instance.messageQueue = []
    }
  }

  /**
   * Gets manager statistics
   */
  getStats(): {
    totalInstances: number
    activeInstances: number
    totalMessages: number
    averageMessageQueueSize: number
    oldestInstance: number | null
  } {
    const instances = Array.from(this.instances.values())
    const activeInstances = instances.filter(i => i.status === 'loaded').length
    const totalMessages = instances.reduce((sum, i) => sum + i.messageQueue.length, 0)
    const averageMessageQueueSize = instances.length > 0 ? totalMessages / instances.length : 0
    const oldestInstance = instances.length > 0 ? Math.min(...instances.map(i => i.createdAt)) : null

    return {
      totalInstances: instances.length,
      activeInstances,
      totalMessages,
      averageMessageQueueSize,
      oldestInstance
    }
  }

  /**
   * Cleanup and destroy the manager
   */
  destroy(): void {
    // Destroy all instances
    Array.from(this.instances.keys()).forEach(id => this.destroyIframe(id))

    // Clear handlers
    this.messageHandlers.clear()

    // Stop cleanup timer
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }

    // Remove global message listener
    window.removeEventListener('message', this.handleGlobalMessage)

    this.log('IframeManager destroyed')
  }

  private initializeMessageListener(): void {
    window.addEventListener('message', this.handleGlobalMessage.bind(this))
  }

  private handleGlobalMessage(event: MessageEvent): void {
    // Find the iframe instance that sent this message
    const instance = Array.from(this.instances.values()).find(
      i => i.element.contentWindow === event.source
    )

    if (!instance) {
      this.log('Received message from unknown iframe:', event)
      return
    }

    // Validate message origin
    if (!instance.securityValidator.validateMessageOrigin(event.origin)) {
      const violation: SecurityViolation = {
        type: 'unauthorized_origin',
        details: `Message from unauthorized origin: ${event.origin}`,
        timestamp: Date.now(),
        severity: 'high'
      }
      this.events.onSecurityViolation?.(instance, violation)
      return
    }

    // Create message object
    const message: IframeMessage = {
      id: this.generateMessageId(),
      type: event.data.type || 'unknown',
      payload: event.data.payload || event.data,
      origin: event.origin,
      timestamp: Date.now(),
      direction: 'incoming',
      iframeId: instance.id
    }

    // Add to message queue
    this.addToMessageQueue(instance, message)

    // Update activity
    instance.lastActivity = Date.now()

    // Handle specific message types
    this.handleSpecificMessage(instance, message)

    // Trigger global message handler
    this.events.onMessage?.(instance, message)

    // Trigger specific message handler
    const handler = this.messageHandlers.get(message.type)
    if (handler) {
      handler(message)
    }

    this.log(`Received message from iframe ${instance.id}:`, message)
  }

  private handleSpecificMessage(instance: IframeInstance, message: IframeMessage): void {
    switch (message.type) {
      case 'iframe-ready':
        instance.status = 'loaded'
        this.events.onLoad?.(instance)
        break

      case 'iframe-error':
        instance.status = 'error'
        const error = new Error(message.payload.message || 'Iframe reported an error')
        this.events.onError?.(instance, error)
        break

      case 'security-check':
        // Respond to security check
        this.sendMessage(instance.id, 'security-response', {
          projectId: instance.projectId,
          timestamp: Date.now(),
          approved: true
        })
        break

      case 'ping':
        // Respond to ping
        this.sendMessage(instance.id, 'pong', {
          timestamp: Date.now()
        })
        break
    }
  }

  private setupIframeEventListeners(instance: IframeInstance): void {
    instance.element.addEventListener('load', () => {
      if (instance.status === 'loading') {
        // Send initial handshake
        setTimeout(() => {
          this.sendMessage(instance.id, 'parent-ready', {
            projectId: instance.projectId,
            timestamp: Date.now(),
            parentOrigin: window.location.origin
          })
        }, 100)
      }
    })

    instance.element.addEventListener('error', () => {
      instance.status = 'error'
      const error = new Error('Iframe failed to load')
      this.events.onError?.(instance, error)
    })
  }

  private addToMessageQueue(instance: IframeInstance, message: IframeMessage): void {
    instance.messageQueue.push(message)
    
    // Trim queue if it exceeds max size
    if (instance.messageQueue.length > this.config.messageQueueSize) {
      instance.messageQueue = instance.messageQueue.slice(-this.config.messageQueueSize)
    }
  }

  private startCleanupTimer(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveInstances()
    }, 60000) // Run every minute
  }

  private cleanupInactiveInstances(): void {
    const now = Date.now()
    const instancesToCleanup: string[] = []

    this.instances.forEach((instance, id) => {
      if (now - instance.lastActivity > this.config.inactivityTimeout) {
        instancesToCleanup.push(id)
      }
    })

    instancesToCleanup.forEach(id => {
      this.log(`Cleaning up inactive iframe: ${id}`)
      this.destroyIframe(id)
    })
  }

  private async cleanupOldestInstance(): Promise<void> {
    let oldestInstance: IframeInstance | null = null
    let oldestTime = Date.now()

    this.instances.forEach(instance => {
      if (instance.createdAt < oldestTime) {
        oldestTime = instance.createdAt
        oldestInstance = instance
      }
    })

    if (oldestInstance) {
      this.log(`Cleaning up oldest iframe to make room: ${oldestInstance.id}`)
      this.destroyIframe(oldestInstance.id)
    }
  }

  private generateIframeId(projectId: string): string {
    return `iframe-${projectId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateMessageId(): string {
    return `msg-${++this.messageIdCounter}-${Date.now()}`
  }

  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[IframeManager] ${message}`, ...args)
    }
  }
}

// Singleton instance for global use
let globalIframeManager: IframeManager | null = null

export const getIframeManager = (
  config?: Partial<IframeManagerConfig>,
  events?: IframeLifecycleEvents
): IframeManager => {
  if (!globalIframeManager) {
    globalIframeManager = new IframeManager(config, events)
  }
  return globalIframeManager
}

export const destroyGlobalIframeManager = (): void => {
  if (globalIframeManager) {
    globalIframeManager.destroy()
    globalIframeManager = null
  }
}

export default IframeManager