export interface PlatformConfig {
  version: string
  base_url: string
  fallback_url: string
  subprojects: Record<string, SubProject>
  models: Record<string, AIModel>
  cache_strategy: CacheStrategy
  optimization: OptimizationConfig
}

export interface SubProject {
  url: string
  local_path: string
  description: string
  models?: string[]
  tools?: string[]
  status?: 'active' | 'maintenance' | 'disabled'
}

export interface AIModel {
  file: string
  size: string
  type: string
  use_cases: string[]
  status?: 'available' | 'downloading' | 'error'
}

export interface CacheStrategy {
  models: string
  tools: string
  builds: string
  artifacts: string
}

export interface OptimizationConfig {
  model_compression: boolean
  tool_precompilation: boolean
  artifact_deduplication: boolean
  cdn_acceleration: boolean
}