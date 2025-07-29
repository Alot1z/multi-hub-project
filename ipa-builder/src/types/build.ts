export interface BuildConfig {
  appName: string
  appType: 'universal' | 'trollstore-15.5' | 'trollstore-17.0'
  features: string[]
  permissions: string[]
  description: string
  targetVersion: string
  customEntitlements?: Record<string, any>
  buildOptions?: BuildOptions
}

export interface BuildOptions {
  enableDebug: boolean
  stripSymbols: boolean
  optimizeSize: boolean
  includeSymbols: boolean
}

export interface BuildResult {
  success: boolean
  buildId?: string
  downloadUrl?: string
  error?: string
  details?: string
  artifacts?: BuildArtifact[]
}

export interface BuildArtifact {
  name: string
  type: 'ipa' | 'deb' | 'manifest' | 'log'
  url: string
  size: number
}