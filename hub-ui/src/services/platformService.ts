import { PlatformConfig } from '../types/platform'

const CONFIG_URLS = [
  'https://alo1z.github.io/.platform.json',
  'https://raw.githubusercontent.com/Alot1z/github.io/main/.platform.json',
  '/.platform.json'
]

export const loadPlatformConfig = async (): Promise<PlatformConfig> => {
  let lastError: Error | null = null

  for (const url of CONFIG_URLS) {
    try {
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const config = await response.json()
        console.log(`✅ Loaded platform config from: ${url}`)
        return config
      }
    } catch (error) {
      console.warn(`Failed to load config from ${url}:`, error)
      lastError = error instanceof Error ? error : new Error('Unknown error')
    }
  }

  // Fallback configuration
  console.warn('Using fallback configuration')
  return {
    version: "1.0.0",
    base_url: "https://alo1z.github.io",
    fallback_url: "https://mose.windsurf.build",
    subprojects: {
      "ipa-builder": {
        url: "PLACEHOLDER_IPA_URL",
        local_path: "/ipa-builder",
        description: "iOS App Builder with TrollStore support"
      },
      "printer-builder": {
        url: "PLACEHOLDER_3D_URL",
        local_path: "/printer-builder",
        description: "3D printer model generator"
      },
      "game-builder": {
        url: "PLACEHOLDER_GAME_URL",
        local_path: "/game-builder",
        description: "Game development platform"
      },
      "ai-models": {
        url: "PLACEHOLDER_AI_URL",
        local_path: "/ai-models",
        description: "AI model management and inference"
      }
    },
    models: {},
    cache_strategy: {
      models: "permanent_repo",
      tools: "permanent_repo",
      builds: "github_actions_cache",
      artifacts: "netlify_static"
    },
    optimization: {
      model_compression: true,
      tool_precompilation: true,
      artifact_deduplication: true,
      cdn_acceleration: true
    }
  }
}