import { PlatformConfig } from '../types/platform'

const SECURE_CONFIG_URLS = [
  'https://Alot1z.github.io/platform.txt',
  'https://raw.githubusercontent.com/Alot1z/Alot1z.github.io/main/platform.txt'
]

export const loadPlatformConfig = async (): Promise<PlatformConfig> => {
  let lastError: Error | null = null

  for (const publicUrl of SECURE_CONFIG_URLS) {
    try {
      // Step 1: Load public platform.txt
      const publicResponse = await fetch(publicUrl, {
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!publicResponse.ok) continue
      
      const publicData = await publicResponse.text()
      const publicLines = publicData.trim().split('\n').filter(line => line.trim())
      
      // Step 2: Security check - verify base URL
      const baseUrl = publicLines[0]?.trim()
      if (!baseUrl || !baseUrl.includes('Alot1z.github.io')) {
        throw new Error('Invalid base URL in public config')
      }
      
      // Step 3: Get private repo URL
      const privateRepoUrl = publicLines[1]?.trim()
      if (!privateRepoUrl) {
        throw new Error('Private repo URL not found')
      }
      
      // Step 4: Load private platform.txt
      const privateUrl = privateRepoUrl.replace('github.com', 'raw.githubusercontent.com') + '/main/platform.txt'
      
      const privateResponse = await fetch(privateUrl, {
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!privateResponse.ok) {
        throw new Error('Cannot access private platform config')
      }
      
      const privateData = await privateResponse.text()
      const config = parseSecurePlatformTxt(publicData, privateData)
      
      console.log(`✅ Loaded secure platform config from: ${publicUrl} -> ${privateUrl}`)
      return config
      
    } catch (error) {
      console.warn(`Failed to load secure config from ${publicUrl}:`, error)
      lastError = error instanceof Error ? error : new Error('Unknown error')
    }
  }

  // Fallback configuration
  console.warn('Using fallback configuration')
  return createFallbackConfig()
}

function parseSecurePlatformTxt(publicData: string, privateData: string): PlatformConfig {
  const publicLines = publicData.trim().split('\n').filter(line => line.trim())
  const privateLines = privateData.trim().split('\n').filter(line => line.trim())
  
  // Security verification - base URLs must match
  const publicBaseUrl = publicLines[0]?.trim()
  const privateBaseUrl = privateLines[0]?.trim()
  
  if (publicBaseUrl !== privateBaseUrl) {
    throw new Error('Base URL mismatch - security violation')
  }
  
  if (!publicBaseUrl?.includes('Alot1z.github.io')) {
    throw new Error('Unauthorized access')
  }
  
  // Parse URLs from private config (lines 2-6)
  return {
    version: "2.0.0",
    base_url: publicBaseUrl,
    fallback_url: privateLines[2]?.trim() || "https://hub-uii.netlify.app",
    subprojects: {
      "hub-ui": {
        url: privateLines[2]?.trim() || "https://hub-uii.netlify.app",
        local_path: "/hub-ui",
        description: "Main platform interface and router"
      },
      "ipa-builder": {
        url: privateLines[3]?.trim() || "https://ipa-builder.netlify.app",
        local_path: "/ipa-builder", 
        description: "iOS IPA builder with TrollStore support"
      },
      "printer-builder": {
        url: privateLines[4]?.trim() || "https://printer-builder.netlify.app",
        local_path: "/printer-builder",
        description: "3D printer model generator"
      },
      "game-builder": {
        url: privateLines[5]?.trim() || "https://game-build.netlify.app",
        local_path: "/game-builder",
        description: "Game development platform"
      },
      "ai-models": {
        url: privateLines[6]?.trim() || "https://ai-modelss.netlify.app",
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

function createFallbackConfig(): PlatformConfig {
  return {
    version: "1.0.0",
    base_url: "https://Alot1z.github.io",
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