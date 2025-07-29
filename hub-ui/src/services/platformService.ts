import { PlatformConfig } from '../types/platform'

const CONFIG_URLS = [
  'https://alo1z.github.io/platform.txt',
  'https://raw.githubusercontent.com/Alot1z/multi-hub-project/main/platform.txt',
  '/platform.txt'
]

export const loadPlatformConfig = async (): Promise<PlatformConfig> => {
  let lastError: Error | null = null

  for (const url of CONFIG_URLS) {
    try {
      const response = await fetch(url, {
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const textData = await response.text()
        const config = parsePlatformTxt(textData)
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
    fallback_url: "https://hub-uii.netlify.app",
    subprojects: {
      "ipa-builder": {
        url: "https://ipa-builder.netlify.app",
        local_path: "/ipa-builder",
        description: "iOS App Builder with TrollStore support"
      },
      "printer-builder": {
        url: "https://printer-builder.netlify.app",
        local_path: "/printer-builder",
        description: "3D printer model generator"
      },
      "game-builder": {
        url: "https://game-build.netlify.app",
        local_path: "/game-builder",
        description: "Game development platform"
      },
      "ai-models": {
        url: "https://ai-modelss.netlify.app",
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

function parsePlatformTxt(textData: string): PlatformConfig {
  const lines = textData.trim().split('\n').filter(line => line.trim())
  
  // First line is always base_url
  const base_url = lines[0]?.trim() || "https://alo1z.github.io"
  
  // Security check - only allow if base_url matches expected
  if (!base_url.includes('alo1z.github.io')) {
    throw new Error('Unauthorized access')
  }
  
  return {
    version: "2.0.0",
    base_url,
    fallback_url: lines[1]?.trim() || "https://hub-uii.netlify.app",
    subprojects: {
      "hub-ui": {
        url: lines[1]?.trim() || "https://hub-uii.netlify.app",
        local_path: "/hub-ui",
        description: "Main platform interface and router"
      },
      "ipa-builder": {
        url: lines[2]?.trim() || "https://ipa-builder.netlify.app",
        local_path: "/ipa-builder", 
        description: "iOS IPA builder with TrollStore support"
      },
      "printer-builder": {
        url: lines[3]?.trim() || "https://printer-builder.netlify.app",
        local_path: "/printer-builder",
        description: "3D printer model generator"
      },
      "game-builder": {
        url: lines[4]?.trim() || "https://game-build.netlify.app",
        local_path: "/game-builder",
        description: "Game development platform"
      },
      "ai-models": {
        url: lines[5]?.trim() || "https://ai-modelss.netlify.app",
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