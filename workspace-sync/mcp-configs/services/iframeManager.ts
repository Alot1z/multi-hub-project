/**
 * Iframe Manager Service - Cross-Platform Communication
 * Handles secure iframe communication across Multi-Hub platform
 */

export interface IframeMessage {
  type: string
  payload: any
  source: string
  target: string
  timestamp: number
}

export interface IframeManager {
  sendMessage: (target: string, type: string, payload: any) => void
  onMessage: (callback: (message: IframeMessage) => void) => void
  registerIframe: (name: string, iframe: HTMLIFrameElement) => void
  unregisterIframe: (name: string) => void
  getIframe: (name: string) => HTMLIFrameElement | null
}

class IframeManagerImpl implements IframeManager {
  private iframes = new Map<string, HTMLIFrameElement>()
  private messageCallbacks: ((message: IframeMessage) => void)[] = []

  constructor() {
    // Listen for postMessage events
    window.addEventListener('message', (event) => {
      try {
        const message: IframeMessage = {
          type: event.data.type || 'unknown',
          payload: event.data.payload || event.data,
          source: event.data.source || event.origin,
          target: event.data.target || window.location.origin,
          timestamp: Date.now()
        }

        // Notify all callbacks
        this.messageCallbacks.forEach(callback => {
          try {
            callback(message)
          } catch (error) {
            console.error('Error in iframe message callback:', error)
          }
        })
      } catch (error) {
        console.error('Error processing iframe message:', error)
      }
    })
  }

  sendMessage(target: string, type: string, payload: any): void {
    const iframe = this.iframes.get(target)
    if (iframe && iframe.contentWindow) {
      const message = {
        type,
        payload,
        source: window.location.origin,
        target,
        timestamp: Date.now()
      }

      iframe.contentWindow.postMessage(message, '*')
    } else {
      console.warn(`Iframe not found: ${target}`)
    }
  }

  onMessage(callback: (message: IframeMessage) => void): void {
    this.messageCallbacks.push(callback)
  }

  registerIframe(name: string, iframe: HTMLIFrameElement): void {
    this.iframes.set(name, iframe)
  }

  unregisterIframe(name: string): void {
    this.iframes.delete(name)
  }

  getIframe(name: string): HTMLIFrameElement | null {
    return this.iframes.get(name) || null
  }
}

// Singleton instance
let iframeManagerInstance: IframeManager | null = null

export function getIframeManager(): IframeManager {
  if (!iframeManagerInstance) {
    iframeManagerInstance = new IframeManagerImpl()
  }
  return iframeManagerInstance
}

export default getIframeManager
