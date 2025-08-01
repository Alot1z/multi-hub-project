/**
 * 🧠 LOCAL MODEL CACHE SYSTEM
 * Permanent caching af AI models uden at fylde GitHub repo
 * Smart storage strategy med GitHub LFS integration
 */

export interface CacheConfig {
  maxCacheSize: number        // Max cache size in MB
  compressionLevel: number    // 0-9 compression level
  enableGitHubLFS: boolean   // Use GitHub LFS for large models
  localCachePath: string     // Local cache directory
  externalStorageUrl?: string // External storage URL
}

export interface ModelCacheEntry {
  modelName: string
  size: number
  downloadDate: Date
  lastUsed: Date
  compressionRatio: number
  storageLocation: 'local' | 'lfs' | 'external'
  checksum: string
}

class LocalModelCache {
  private config: CacheConfig
  private cacheEntries = new Map<string, ModelCacheEntry>()
  private memoryCache = new Map<string, ArrayBuffer>()

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxCacheSize: 5000, // 5GB max cache
      compressionLevel: 6,
      enableGitHubLFS: true,
      localCachePath: '.ai-models-cache',
      ...config
    }

    this.initializeCache()
  }

  private async initializeCache() {
    // Create cache directory if it doesn't exist
    await this.ensureCacheDirectory()
    
    // Load existing cache entries
    await this.loadCacheIndex()
    
    // Setup .gitignore to exclude cache from main repo
    await this.setupGitIgnore()
  }

  // Ensure cache directory exists
  private async ensureCacheDirectory() {
    try {
      await fetch('/api/fs/mkdir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: this.config.localCachePath })
      })
    } catch (error) {
      console.warn('Failed to create cache directory:', error)
    }
  }

  // Setup .gitignore to exclude cache
  private async setupGitIgnore() {
    const gitignoreContent = `
# AI Models Cache - Excluded from main repo
${this.config.localCachePath}/
*.bin
*.safetensors
*.gguf
*.onnx

# Use GitHub LFS for large model files
# See .gitattributes for LFS configuration
`

    try {
      await fetch('/api/fs/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          path: '.gitignore', 
          content: gitignoreContent 
        })
      })
    } catch (error) {
      console.warn('Failed to update .gitignore:', error)
    }
  }

  // Load cache index
  private async loadCacheIndex() {
    try {
      const response = await fetch(`/api/fs/read?path=${this.config.localCachePath}/cache-index.json`)
      if (response.ok) {
        const data = await response.json()
        this.cacheEntries = new Map(Object.entries(data))
      }
    } catch (error) {
      console.log('No existing cache index found, starting fresh')
    }
  }

  // Save cache index
  private async saveCacheIndex() {
    const indexData = Object.fromEntries(this.cacheEntries)
    
    try {
      await fetch('/api/fs/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: `${this.config.localCachePath}/cache-index.json`,
          content: JSON.stringify(indexData, null, 2)
        })
      })
    } catch (error) {
      console.error('Failed to save cache index:', error)
    }
  }

  // Download and cache model
  async cacheModel(modelName: string, downloadUrl: string): Promise<boolean> {
    console.log(`📥 Caching model: ${modelName}`)
    
    try {
      // Check if already cached
      if (this.cacheEntries.has(modelName)) {
        console.log(`✅ Model ${modelName} already cached`)
        return true
      }

      // Download model
      const response = await fetch(downloadUrl)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const modelData = await response.arrayBuffer()
      const originalSize = modelData.byteLength

      // Compress model data
      const compressedData = await this.compressData(modelData)
      const compressionRatio = compressedData.byteLength / originalSize

      // Calculate checksum
      const checksum = await this.calculateChecksum(modelData)

      // Determine storage location
      const storageLocation = this.determineStorageLocation(compressedData.byteLength)

      // Store model
      await this.storeModel(modelName, compressedData, storageLocation)

      // Update cache entry
      const cacheEntry: ModelCacheEntry = {
        modelName,
        size: compressedData.byteLength,
        downloadDate: new Date(),
        lastUsed: new Date(),
        compressionRatio,
        storageLocation,
        checksum
      }

      this.cacheEntries.set(modelName, cacheEntry)
      this.memoryCache.set(modelName, modelData) // Keep original in memory

      // Save cache index
      await this.saveCacheIndex()

      console.log(`✅ Model ${modelName} cached successfully (${this.formatSize(originalSize)} → ${this.formatSize(compressedData.byteLength)})`)
      return true

    } catch (error) {
      console.error(`Failed to cache model ${modelName}:`, error)
      return false
    }
  }

  // Get cached model
  async getModel(modelName: string): Promise<ArrayBuffer | null> {
    // Check memory cache first
    if (this.memoryCache.has(modelName)) {
      console.log(`🚀 Memory cache hit: ${modelName}`)
      return this.memoryCache.get(modelName)!
    }

    // Check if model is cached
    const cacheEntry = this.cacheEntries.get(modelName)
    if (!cacheEntry) {
      return null
    }

    try {
      // Load from storage
      const compressedData = await this.loadModel(modelName, cacheEntry.storageLocation)
      if (!compressedData) {
        return null
      }

      // Decompress
      const modelData = await this.decompressData(compressedData)

      // Verify checksum
      const checksum = await this.calculateChecksum(modelData)
      if (checksum !== cacheEntry.checksum) {
        console.error(`Checksum mismatch for ${modelName}`)
        return null
      }

      // Update last used
      cacheEntry.lastUsed = new Date()
      await this.saveCacheIndex()

      // Cache in memory for faster access
      this.memoryCache.set(modelName, modelData)

      console.log(`✅ Model ${modelName} loaded from cache`)
      return modelData

    } catch (error) {
      console.error(`Failed to load cached model ${modelName}:`, error)
      return null
    }
  }

  // Determine storage location based on size
  private determineStorageLocation(size: number): 'local' | 'lfs' | 'external' {
    const sizeMB = size / (1024 * 1024)
    
    if (sizeMB < 100) {
      return 'local' // Small models stored locally
    } else if (sizeMB < 1000 && this.config.enableGitHubLFS) {
      return 'lfs' // Medium models in GitHub LFS
    } else {
      return 'external' // Large models in external storage
    }
  }

  // Store model in appropriate location
  private async storeModel(modelName: string, data: ArrayBuffer, location: 'local' | 'lfs' | 'external') {
    switch (location) {
      case 'local':
        await this.storeLocal(modelName, data)
        break
      case 'lfs':
        await this.storeInLFS(modelName, data)
        break
      case 'external':
        await this.storeExternal(modelName, data)
        break
    }
  }

  // Store in local cache
  private async storeLocal(modelName: string, data: ArrayBuffer) {
    const filePath = `${this.config.localCachePath}/${modelName}.bin`
    
    try {
      await fetch('/api/fs/write-binary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: JSON.stringify({
          path: filePath,
          data: Array.from(new Uint8Array(data))
        })
      })
    } catch (error) {
      throw new Error(`Failed to store locally: ${error}`)
    }
  }

  // Store in GitHub LFS
  private async storeInLFS(modelName: string, data: ArrayBuffer) {
    // This would use GitHub LFS API to store large files
    // For now, we'll store locally and mark for LFS
    await this.storeLocal(modelName, data)
    
    // Create .gitattributes entry for LFS
    const gitattributesContent = `${this.config.localCachePath}/${modelName}.bin filter=lfs diff=lfs merge=lfs -text\n`
    
    try {
      await fetch('/api/fs/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '.gitattributes',
          content: gitattributesContent
        })
      })
    } catch (error) {
      console.warn('Failed to update .gitattributes:', error)
    }
  }

  // Store in external storage
  private async storeExternal(modelName: string, data: ArrayBuffer) {
    if (!this.config.externalStorageUrl) {
      // Fallback to local storage
      await this.storeLocal(modelName, data)
      return
    }

    try {
      const response = await fetch(`${this.config.externalStorageUrl}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Model-Name': modelName
        },
        body: data
      })

      if (!response.ok) {
        throw new Error(`External storage failed: ${response.statusText}`)
      }
    } catch (error) {
      console.warn('External storage failed, falling back to local:', error)
      await this.storeLocal(modelName, data)
    }
  }

  // Load model from storage
  private async loadModel(modelName: string, location: 'local' | 'lfs' | 'external'): Promise<ArrayBuffer | null> {
    switch (location) {
      case 'local':
      case 'lfs': // LFS files are accessed like local files
        return await this.loadLocal(modelName)
      case 'external':
        return await this.loadExternal(modelName)
      default:
        return null
    }
  }

  // Load from local cache
  private async loadLocal(modelName: string): Promise<ArrayBuffer | null> {
    const filePath = `${this.config.localCachePath}/${modelName}.bin`
    
    try {
      const response = await fetch(`/api/fs/read-binary?path=${filePath}`)
      if (response.ok) {
        return await response.arrayBuffer()
      }
    } catch (error) {
      console.error(`Failed to load local model ${modelName}:`, error)
    }
    
    return null
  }

  // Load from external storage
  private async loadExternal(modelName: string): Promise<ArrayBuffer | null> {
    if (!this.config.externalStorageUrl) {
      return null
    }

    try {
      const response = await fetch(`${this.config.externalStorageUrl}/download/${modelName}`)
      if (response.ok) {
        return await response.arrayBuffer()
      }
    } catch (error) {
      console.error(`Failed to load external model ${modelName}:`, error)
    }

    return null
  }

  // Compress data
  private async compressData(data: ArrayBuffer): Promise<ArrayBuffer> {
    // Use CompressionStream API if available
    if ('CompressionStream' in window) {
      const stream = new CompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()
      
      writer.write(new Uint8Array(data))
      writer.close()
      
      const chunks: Uint8Array[] = []
      let result = await reader.read()
      
      while (!result.done) {
        chunks.push(result.value)
        result = await reader.read()
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const compressed = new Uint8Array(totalLength)
      let offset = 0
      
      for (const chunk of chunks) {
        compressed.set(chunk, offset)
        offset += chunk.length
      }
      
      return compressed.buffer
    }
    
    // Fallback: return original data if compression not available
    return data
  }

  // Decompress data
  private async decompressData(compressedData: ArrayBuffer): Promise<ArrayBuffer> {
    // Use DecompressionStream API if available
    if ('DecompressionStream' in window) {
      const stream = new DecompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()
      
      writer.write(new Uint8Array(compressedData))
      writer.close()
      
      const chunks: Uint8Array[] = []
      let result = await reader.read()
      
      while (!result.done) {
        chunks.push(result.value)
        result = await reader.read()
      }
      
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const decompressed = new Uint8Array(totalLength)
      let offset = 0
      
      for (const chunk of chunks) {
        decompressed.set(chunk, offset)
        offset += chunk.length
      }
      
      return decompressed.buffer
    }
    
    // Fallback: return original data if decompression not available
    return compressedData
  }

  // Calculate checksum
  private async calculateChecksum(data: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Format file size
  private formatSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  // Get cache statistics
  getCacheStats(): {
    totalModels: number
    totalSize: number
    localModels: number
    lfsModels: number
    externalModels: number
    compressionRatio: number
  } {
    const entries = Array.from(this.cacheEntries.values())
    
    return {
      totalModels: entries.length,
      totalSize: entries.reduce((sum, entry) => sum + entry.size, 0),
      localModels: entries.filter(e => e.storageLocation === 'local').length,
      lfsModels: entries.filter(e => e.storageLocation === 'lfs').length,
      externalModels: entries.filter(e => e.storageLocation === 'external').length,
      compressionRatio: entries.reduce((sum, entry) => sum + entry.compressionRatio, 0) / entries.length
    }
  }

  // Clean up old models
  async cleanupCache(maxAge: number = 30): Promise<void> {
    const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000)
    const toRemove: string[] = []
    
    for (const [modelName, entry] of this.cacheEntries) {
      if (entry.lastUsed < cutoffDate) {
        toRemove.push(modelName)
      }
    }
    
    for (const modelName of toRemove) {
      await this.removeModel(modelName)
    }
    
    console.log(`🧹 Cleaned up ${toRemove.length} old models`)
  }

  // Remove model from cache
  async removeModel(modelName: string): Promise<void> {
    const entry = this.cacheEntries.get(modelName)
    if (!entry) return
    
    try {
      // Remove from storage
      if (entry.storageLocation === 'local' || entry.storageLocation === 'lfs') {
        await fetch('/api/fs/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: `${this.config.localCachePath}/${modelName}.bin`
          })
        })
      }
      
      // Remove from memory cache
      this.memoryCache.delete(modelName)
      
      // Remove from cache entries
      this.cacheEntries.delete(modelName)
      
      // Save updated index
      await this.saveCacheIndex()
      
      console.log(`🗑️ Removed model ${modelName} from cache`)
    } catch (error) {
      console.error(`Failed to remove model ${modelName}:`, error)
    }
  }

  // Get cache status and statistics
  getStatus() {
    const totalSize = Array.from(this.cacheEntries.values())
      .reduce((sum, entry) => sum + entry.size, 0)
    
    const modelCount = this.cacheEntries.size
    const memoryUsage = this.memoryCache.size
    
    return {
      totalSize,
      modelCount,
      memoryUsage,
      maxCacheSize: this.config.maxCacheSize * 1024 * 1024, // Convert MB to bytes
      usagePercentage: (totalSize / (this.config.maxCacheSize * 1024 * 1024)) * 100,
      models: Array.from(this.cacheEntries.entries()).map(([name, entry]) => ({
        name,
        size: entry.size,
        lastUsed: entry.lastUsed,
        storageLocation: entry.storageLocation
      }))
    }
  }
}

// Export singleton instance
export const localModelCache = new LocalModelCache()
export default localModelCache
