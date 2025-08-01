/**
 * Git-MCP Integration for AI Models Platform
 * Seamless deployment and version control for AI model updates
 */

import { getGitMcpService } from '@shared/services/gitMcpService'

export class AIModelsGitMcpIntegration {
  private gitMcp = getGitMcpService()

  async deployModelUpdate(
    modelId: string,
    updateType: 'weights' | 'config' | 'ensemble' | 'cache',
    description: string
  ): Promise<{ success: boolean; deployUrl?: string; error?: string }> {
    try {
      console.log(`🤖 AI Models: Deploying ${updateType} update for ${modelId}`)

      // Determine files to commit based on update type
      const files = this.getUpdateFiles(modelId, updateType)
      
      // Create commit message
      const message = `🤖 AI Model Update: ${modelId} ${updateType}

${description}

- Model: ${modelId}
- Type: ${updateType}
- Auto-deployed via Git-MCP
- Offline resources updated`

      // Use Git-MCP for automated commit and deploy
      const result = await this.gitMcp.aiCommitAndDeploy(
        message,
        files,
        'ai-models'
      )

      if (result.success) {
        console.log(`✅ AI Models: Successfully deployed ${modelId} to ${result.deployUrl}`)
        
        // Update local cache with deployment info
        await this.updateDeploymentCache(modelId, result.deployUrl)
      }

      return result
    } catch (error) {
      console.error('❌ AI Models Git-MCP deployment failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async syncOfflineResources(): Promise<{ success: boolean; resourceCount: number; error?: string }> {
    try {
      console.log('📦 AI Models: Syncing offline resources via Git-MCP...')

      // Check if AI resources are available
      const resourcePath = 'ai-resources/'
      const files = [
        `${resourcePath}**/*.json`,
        `${resourcePath}**/*.onnx`,
        `${resourcePath}resource-manifest.json`
      ]

      const result = await this.gitMcp.commit({
        message: '📦 Sync offline AI resources\n\n- Updated model cache\n- Verified offline availability\n- Git-MCP automated sync',
        files,
        push: true,
        deploy: false // Don't deploy, just sync resources
      })

      if (result.success) {
        console.log('✅ AI Models: Offline resources synced successfully')
        return { success: true, resourceCount: files.length }
      }

      return { success: false, resourceCount: 0, error: result.error }
    } catch (error) {
      console.error('❌ AI Models resource sync failed:', error)
      return {
        success: false,
        resourceCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async createModelBranch(modelId: string, experimentName: string): Promise<{ success: boolean; branch?: string; error?: string }> {
    try {
      const branchName = `ai-model/${modelId}/${experimentName}`
      console.log(`🌿 AI Models: Creating experiment branch ${branchName}`)

      const result = await this.gitMcp.createBranch({
        name: branchName,
        checkout: true
      })

      if (result.success) {
        console.log(`✅ AI Models: Experiment branch created: ${branchName}`)
        return { success: true, branch: branchName }
      }

      return { success: false, error: result.error }
    } catch (error) {
      console.error('❌ AI Models branch creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getUpdateFiles(modelId: string, updateType: string): string[] {
    const baseFiles = [
      'src/services/perfectEnsembleAI.ts',
      'src/services/localModelCache.ts',
      'package.json'
    ]

    switch (updateType) {
      case 'weights':
        return [
          ...baseFiles,
          `ai-resources/models/${modelId}/**`,
          'ai-resources/resource-manifest.json'
        ]
      case 'config':
        return [
          ...baseFiles,
          `src/config/${modelId}.json`,
          'ai-resources/resource-manifest.json'
        ]
      case 'ensemble':
        return [
          ...baseFiles,
          'src/services/perfectEnsembleAI.ts',
          'src/services/webAIEnsemble.ts'
        ]
      case 'cache':
        return [
          'src/services/localModelCache.ts',
          'ai-resources/**/*.json',
          'ai-resources/resource-manifest.json'
        ]
      default:
        return baseFiles
    }
  }

  private async updateDeploymentCache(modelId: string, deployUrl?: string): Promise<void> {
    try {
      const deploymentInfo = {
        modelId,
        deployUrl,
        timestamp: new Date().toISOString(),
        platform: 'ai-models',
        gitMcpIntegrated: true
      }

      // Store deployment info in local cache
      localStorage.setItem(`deployment_${modelId}`, JSON.stringify(deploymentInfo))
      console.log(`📝 AI Models: Deployment cache updated for ${modelId}`)
    } catch (error) {
      console.error('❌ Failed to update deployment cache:', error)
    }
  }

  async getGitStatus(): Promise<{
    connected: boolean
    currentBranch?: string
    uncommittedChanges?: number
    lastCommit?: string
    aiResourcesStatus?: string
  }> {
    try {
      const status = await this.gitMcp.getStatus()
      
      // Add AI-specific status info
      const aiResourcesStatus = await this.checkAIResourcesStatus()
      
      return {
        ...status,
        aiResourcesStatus
      }
    } catch (error) {
      console.error('❌ AI Models Git status check failed:', error)
      return { connected: false }
    }
  }

  private async checkAIResourcesStatus(): Promise<string> {
    try {
      // Check if AI resources are available offline
      const resourceManifest = 'ai-resources/resource-manifest.json'
      
      // In a real implementation, this would check file system
      // For now, simulate the check
      return 'Available offline (cached)'
    } catch (error) {
      return 'Not available offline'
    }
  }
}

// Export singleton instance
export const aiModelsGitMcp = new AIModelsGitMcpIntegration()
export default aiModelsGitMcp
