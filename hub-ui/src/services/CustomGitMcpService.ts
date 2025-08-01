/**
 * Custom GitMCP Service for Alot1z.github.io
 * A private, hosted Git MCP service that only works through Alot1z.github.io
 * Similar to gitmcp.io but exclusively for Multi-Hub platform
 */

export interface GitMcpConfig {
  baseUrl: string
  apiKey: string
  repositoryOwner: string
  allowedDomains: string[]
  rateLimits: {
    requestsPerMinute: number
    requestsPerHour: number
  }
}

export interface GitOperation {
  type: 'commit' | 'branch' | 'merge' | 'push' | 'pull' | 'status'
  repository: string
  branch?: string
  message?: string
  files?: GitFile[]
  timestamp: number
  success: boolean
  result?: any
  error?: string
}

export interface GitFile {
  path: string
  content: string
  action: 'create' | 'update' | 'delete'
  encoding?: 'utf8' | 'base64'
}

export interface RepositoryInfo {
  owner: string
  name: string
  fullName: string
  private: boolean
  defaultBranch: string
  branches: string[]
  lastCommit: {
    sha: string
    message: string
    author: string
    date: string
  }
}

export class CustomGitMcpService {
  private config: GitMcpConfig
  private operationHistory: GitOperation[] = []
  private isAuthenticated = false

  constructor(config: GitMcpConfig) {
    this.config = config
  }

  /**
   * Initialize the service and verify domain access
   */
  async initialize(): Promise<void> {
    // Verify we're running from allowed domain
    const currentDomain = window.location.hostname
    if (!this.config.allowedDomains.includes(currentDomain)) {
      throw new Error(`Access denied. This service only works from: ${this.config.allowedDomains.join(', ')}`)
    }

    // Authenticate with the custom GitMCP service
    await this.authenticate()
    
    console.log('Custom GitMCP Service initialized for Multi-Hub platform')
  }

  /**
   * Create a new branch for feature development
   */
  async createFeatureBranch(
    repository: string, 
    baseBranch: string = 'main',
    featureName?: string
  ): Promise<GitOperation> {
    await this.ensureAuthenticated()

    const branchName = featureName || `feature/multi-hub-${Date.now()}`
    
    try {
      const response = await this.makeApiCall('/git/branch', {
        method: 'POST',
        body: JSON.stringify({
          repository,
          baseBranch,
          newBranch: branchName,
          source: 'alot1z.github.io'
        })
      })

      const operation: GitOperation = {
        type: 'branch',
        repository,
        branch: branchName,
        timestamp: Date.now(),
        success: true,
        result: response
      }

      this.operationHistory.push(operation)
      return operation

    } catch (error) {
      const operation: GitOperation = {
        type: 'branch',
        repository,
        branch: branchName,
        timestamp: Date.now(),
        success: false,
        error: error.message
      }

      this.operationHistory.push(operation)
      throw error
    }
  }

  /**
   * Commit files to repository
   */
  async commitFiles(
    repository: string,
    branch: string,
    files: GitFile[],
    message: string
  ): Promise<GitOperation> {
    await this.ensureAuthenticated()

    try {
      const response = await this.makeApiCall('/git/commit', {
        method: 'POST',
        body: JSON.stringify({
          repository,
          branch,
          files,
          message,
          author: {
            name: 'Multi-Hub Bot',
            email: 'bot@alot1z.github.io'
          },
          source: 'alot1z.github.io'
        })
      })

      const operation: GitOperation = {
        type: 'commit',
        repository,
        branch,
        message,
        files,
        timestamp: Date.now(),
        success: true,
        result: response
      }

      this.operationHistory.push(operation)
      return operation

    } catch (error) {
      const operation: GitOperation = {
        type: 'commit',
        repository,
        branch,
        message,
        files,
        timestamp: Date.now(),
        success: false,
        error: error.message
      }

      this.operationHistory.push(operation)
      throw error
    }
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(repository: string): Promise<RepositoryInfo> {
    await this.ensureAuthenticated()

    try {
      const response = await this.makeApiCall(`/git/repo/${repository}`, {
        method: 'GET'
      })

      return response as RepositoryInfo

    } catch (error) {
      console.error(`Failed to get repository info for ${repository}:`, error)
      throw error
    }
  }

  /**
   * Trigger Netlify deployment for a repository
   */
  async triggerDeployment(
    repository: string,
    branch: string = 'main'
  ): Promise<GitOperation> {
    await this.ensureAuthenticated()

    try {
      const response = await this.makeApiCall('/deploy/netlify', {
        method: 'POST',
        body: JSON.stringify({
          repository,
          branch,
          source: 'alot1z.github.io'
        })
      })

      const operation: GitOperation = {
        type: 'push', // Using push type for deployment
        repository,
        branch,
        timestamp: Date.now(),
        success: true,
        result: response
      }

      this.operationHistory.push(operation)
      return operation

    } catch (error) {
      const operation: GitOperation = {
        type: 'push',
        repository,
        branch,
        timestamp: Date.now(),
        success: false,
        error: error.message
      }

      this.operationHistory.push(operation)
      throw error
    }
  }

  /**
   * Complete workflow: Create branch, commit files, deploy
   */
  async executeCompleteWorkflow(
    repository: string,
    files: GitFile[],
    commitMessage: string,
    featureName?: string
  ): Promise<{
    branch: GitOperation
    commit: GitOperation
    deployment: GitOperation
  }> {
    console.log(`🚀 Starting complete Git workflow for ${repository}`)

    // Step 1: Create feature branch
    const branchOp = await this.createFeatureBranch(repository, 'main', featureName)
    console.log(`✅ Created branch: ${branchOp.branch}`)

    // Step 2: Commit files
    const commitOp = await this.commitFiles(
      repository, 
      branchOp.branch!, 
      files, 
      commitMessage
    )
    console.log(`✅ Committed ${files.length} files`)

    // Step 3: Trigger deployment
    const deploymentOp = await this.triggerDeployment(repository, branchOp.branch!)
    console.log(`✅ Triggered deployment`)

    return {
      branch: branchOp,
      commit: commitOp,
      deployment: deploymentOp
    }
  }

  /**
   * Get operation history
   */
  getOperationHistory(): GitOperation[] {
    return [...this.operationHistory]
  }

  /**
   * Clear operation history
   */
  clearHistory(): void {
    this.operationHistory = []
  }

  /**
   * Get service statistics
   */
  getStats(): {
    totalOperations: number
    successfulOperations: number
    failedOperations: number
    operationsByType: Record<string, number>
  } {
    const total = this.operationHistory.length
    const successful = this.operationHistory.filter(op => op.success).length
    const failed = total - successful

    const byType = this.operationHistory.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalOperations: total,
      successfulOperations: successful,
      failedOperations: failed,
      operationsByType: byType
    }
  }

  // Private methods

  private async authenticate(): Promise<void> {
    try {
      const response = await this.makeApiCall('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({
          domain: window.location.hostname,
          source: 'alot1z.github.io'
        })
      })

      if (response.authenticated) {
        this.isAuthenticated = true
        console.log('✅ Authenticated with Custom GitMCP Service')
      } else {
        throw new Error('Authentication failed')
      }

    } catch (error) {
      console.error('❌ Failed to authenticate with Custom GitMCP Service:', error)
      throw error
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated) {
      await this.authenticate()
    }
  }

  private async makeApiCall(endpoint: string, options: RequestInit): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-Source-Domain': window.location.hostname,
        'X-Multi-Hub-Platform': 'true',
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }))
      throw new Error(`GitMCP API Error: ${error.message}`)
    }

    return response.json()
  }
}

// Configuration for Alot1z.github.io
export const createCustomGitMcpService = (): CustomGitMcpService => {
  const config: GitMcpConfig = {
    baseUrl: 'https://api.alot1z.github.io/gitmcp', // Your custom GitMCP API
    apiKey: process.env.REACT_APP_GITMCP_API_KEY || 'demo-key',
    repositoryOwner: 'Alot1z',
    allowedDomains: [
      'alot1z.github.io',
      'localhost', // For development
      '127.0.0.1'  // For development
    ],
    rateLimits: {
      requestsPerMinute: 60,
      requestsPerHour: 1000
    }
  }

  return new CustomGitMcpService(config)
}

// Multi-Hub Platform Integration
export const integrateWithMultiHub = async (
  gitMcpService: CustomGitMcpService,
  builderType: 'ipa-builder' | 'printer-builder' | 'game-builder' | 'ai-models' | 'hub-ui',
  generatedFiles: GitFile[],
  commitMessage: string
): Promise<string> => {
  const repositoryMap = {
    'ipa-builder': 'Alot1z/ipa-builder',
    'printer-builder': 'Alot1z/printer-builder',
    'game-builder': 'Alot1z/game-builder',
    'ai-models': 'Alot1z/ai-models',
    'hub-ui': 'Alot1z/hub-ui'
  }

  const repository = repositoryMap[builderType]
  const featureName = `${builderType}-${Date.now()}`

  try {
    const workflow = await gitMcpService.executeCompleteWorkflow(
      repository,
      generatedFiles,
      commitMessage,
      featureName
    )

    // Return deployment URL
    const deploymentUrl = `https://alot1z-${builderType.replace('-builder', '')}.netlify.app`
    return deploymentUrl

  } catch (error) {
    console.error(`Failed to integrate with Multi-Hub for ${builderType}:`, error)
    throw error
  }
}

export default CustomGitMcpService
