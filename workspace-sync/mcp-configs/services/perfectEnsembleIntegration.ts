/**
 * 🚀 PERFECT ENSEMBLE INTEGRATION - 100% PÅ DIN URL
 * 
 * FEATURES:
 * ✅ 50+ programmer per måned uden rate limits
 * ✅ Crossarbejdende AI models - altid topnotch
 * ✅ Ingen forking - alt på dine domæner
 * ✅ Perfect integration med auth system
 * ✅ Automatic model selection - brugere kan ikke vælge
 */

import { perfectEnsembleAI } from '../../ai-models/src/services/perfectEnsembleAI'
import { authService } from '../../auth/src/services/authService'

export interface BuilderRequest {
  type: 'ipa' | 'printer' | 'game' | 'ai-model' | 'general'
  prompt: string
  complexity: 'simple' | 'medium' | 'complex' | 'enterprise'
  userId?: string
  sessionId?: string
}

export interface BuilderResponse {
  success: boolean
  code?: string
  files?: { [filename: string]: string }
  instructions?: string[]
  deploymentUrl?: string
  error?: string
  metadata: {
    modelsUsed: string[]
    winningModel: string
    confidence: number
    responseTime: number
    usageCount: number
    remainingUsage: number
  }
}

class PerfectEnsembleIntegration {
  private isInitialized = false
  private deploymentUrls = {
    'hub-ui': 'https://alot1z-hub-ui.netlify.app',
    'ipa-builder': 'https://alot1z-ipa-builder.netlify.app',
    'printer-builder': 'https://alot1z-printer-builder.netlify.app',
    'game-builder': 'https://alot1z-game-builder.netlify.app',
    'ai-models': 'https://alot1z-ai-models.netlify.app'
  }

  constructor() {
    this.initialize()
  }

  private async initialize() {
    try {
      // Ensure all services are ready
      await this.waitForServices()
      
      // Setup cross-model AI optimization
      await this.setupCrossModelOptimization()
      
      this.isInitialized = true
      console.log('🚀 Perfect Ensemble Integration initialized')
    } catch (error) {
      console.error('Failed to initialize Perfect Ensemble:', error)
    }
  }

  private async waitForServices() {
    // Wait for auth service
    let attempts = 0
    while (!authService.getSystemStatus && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }

    // Wait for AI ensemble
    attempts = 0
    while (!perfectEnsembleAI.isReady && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      attempts++
    }
  }

  private async setupCrossModelOptimization() {
    // Configure AI models for cross-work optimization
    const optimizationConfig = {
      // IPA Builder optimization
      ipa: {
        primaryModels: ['codellama-34b', 'deepseek-coder', 'qwen2.5-coder'],
        fallbackModels: ['phi-3-medium', 'mistral-7b-instruct'],
        specializations: ['swift', 'objective-c', 'ios', 'trollstore']
      },
      
      // 3D Printer optimization
      printer: {
        primaryModels: ['codellama-34b', 'claude-3-haiku', 'gpt-4o-mini'],
        fallbackModels: ['mistral-7b-instruct', 'phi-3-medium'],
        specializations: ['openscad', '3d-modeling', 'gcode', 'cad']
      },
      
      // Game Builder optimization
      game: {
        primaryModels: ['codellama-34b', 'deepseek-coder', 'claude-3-haiku'],
        fallbackModels: ['qwen2.5-coder', 'mistral-7b-instruct'],
        specializations: ['unity', 'unreal', 'javascript', 'c#', 'game-logic']
      },
      
      // AI Models optimization
      'ai-model': {
        primaryModels: ['claude-3-haiku', 'gpt-4o-mini', 'gemini-1.5-flash'],
        fallbackModels: ['codellama-34b', 'deepseek-coder'],
        specializations: ['machine-learning', 'neural-networks', 'ai-training']
      }
    }

    // Apply optimization to ensemble
    await perfectEnsembleAI.configureOptimization(optimizationConfig)
  }

  // Main generation method - ALWAYS uses best models automatically
  async generateCode(request: BuilderRequest): Promise<BuilderResponse> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    try {
      // Validate user and usage limits
      const user = await this.validateUser(request.sessionId)
      if (!user) {
        return {
          success: false,
          error: 'Authentication required',
          metadata: {
            modelsUsed: [],
            winningModel: '',
            confidence: 0,
            responseTime: 0,
            usageCount: 0,
            remainingUsage: 0
          }
        }
      }

      // Check usage limits (unless unlimited is enabled)
      const canUse = authService.canUseProgram(user)
      if (!canUse) {
        const status = authService.getSystemStatus()
        return {
          success: false,
          error: `Monthly limit reached. You've used ${user.usageStats.programsThisMonth} programs this month.`,
          metadata: {
            modelsUsed: [],
            winningModel: '',
            confidence: 0,
            responseTime: 0,
            usageCount: user.usageStats.programsThisMonth,
            remainingUsage: status.unlimitedUsage ? 999999 : (50 - user.usageStats.programsThisMonth)
          }
        }
      }

      // Generate enhanced prompt based on builder type
      const enhancedPrompt = this.enhancePrompt(request)

      // Use perfect ensemble - ALL models run simultaneously
      const startTime = Date.now()
      const aiResponse = await perfectEnsembleAI.generate(enhancedPrompt, {
        builderType: request.type,
        complexity: request.complexity,
        useVoting: true,
        minConfidence: 0.8,
        maxTokens: this.getMaxTokens(request.complexity),
        temperature: this.getTemperature(request.type)
      })

      const responseTime = Date.now() - startTime

      // Process response based on builder type
      const processedResponse = await this.processBuilderResponse(request.type, aiResponse)

      // Increment usage counter
      await authService.incrementUsage(user)

      // Return successful response
      return {
        success: true,
        ...processedResponse,
        metadata: {
          modelsUsed: aiResponse.modelsUsed,
          winningModel: aiResponse.winningModel,
          confidence: aiResponse.confidence,
          responseTime,
          usageCount: user.usageStats.programsThisMonth + 1,
          remainingUsage: authService.getSystemStatus().unlimitedUsage ? 999999 : (49 - user.usageStats.programsThisMonth)
        }
      }

    } catch (error) {
      console.error('Generation failed:', error)
      return {
        success: false,
        error: `Generation failed: ${error.message}`,
        metadata: {
          modelsUsed: [],
          winningModel: '',
          confidence: 0,
          responseTime: 0,
          usageCount: 0,
          remainingUsage: 0
        }
      }
    }
  }

  private async validateUser(sessionId?: string) {
    if (!sessionId) {
      // Check if guest access is allowed
      const status = authService.getSystemStatus()
      if (!status.authEnabled) {
        return authService.validateSession('guest-session')
      }
      return null
    }

    return authService.validateSession(sessionId)
  }

  private enhancePrompt(request: BuilderRequest): string {
    const basePrompt = request.prompt

    // Add builder-specific context
    const builderContext = {
      ipa: `
You are building an iOS app using TrollStore compatibility.
Focus on:
- Swift/Objective-C code
- iOS best practices
- TrollStore deployment
- Clean, modern UI
- Proper app structure
`,
      printer: `
You are creating 3D printer models and G-code.
Focus on:
- OpenSCAD code
- Printable designs
- Proper dimensions
- Support structures
- Print optimization
`,
      game: `
You are developing a game.
Focus on:
- Game mechanics
- Clean code structure
- Performance optimization
- User experience
- Cross-platform compatibility
`,
      'ai-model': `
You are working with AI models and machine learning.
Focus on:
- Model architecture
- Training optimization
- Inference efficiency
- Data processing
- Performance metrics
`,
      general: `
You are creating high-quality code.
Focus on:
- Best practices
- Clean architecture
- Performance
- Maintainability
- Documentation
`
    }

    const complexityContext = {
      simple: 'Create a simple, straightforward solution.',
      medium: 'Create a well-structured solution with good practices.',
      complex: 'Create a comprehensive solution with advanced features.',
      enterprise: 'Create an enterprise-grade solution with full documentation and testing.'
    }

    return `${builderContext[request.type] || builderContext.general}

${complexityContext[request.complexity]}

User Request: ${basePrompt}

Requirements:
- Generate complete, working code
- Include all necessary files
- Add proper comments and documentation
- Ensure code is immediately runnable
- Follow best practices for ${request.type} development
`
  }

  private getMaxTokens(complexity: string): number {
    const tokenLimits = {
      simple: 2000,
      medium: 4000,
      complex: 6000,
      enterprise: 8000
    }
    return tokenLimits[complexity] || 4000
  }

  private getTemperature(builderType: string): number {
    const temperatures = {
      ipa: 0.3,        // More deterministic for iOS
      printer: 0.2,    // Very precise for 3D models
      game: 0.5,       // Creative for games
      'ai-model': 0.4, // Balanced for AI
      general: 0.4
    }
    return temperatures[builderType] || 0.4
  }

  private async processBuilderResponse(builderType: string, aiResponse: any) {
    const code = aiResponse.content

    // Extract files from code if multiple files are present
    const files = this.extractFiles(code)

    // Generate deployment instructions
    const instructions = this.generateInstructions(builderType, files)

    // Get deployment URL
    const deploymentUrl = this.getDeploymentUrl(builderType)

    return {
      code,
      files,
      instructions,
      deploymentUrl
    }
  }

  private extractFiles(code: string): { [filename: string]: string } {
    const files: { [filename: string]: string } = {}
    
    // Look for file separators in the code
    const filePattern = /\/\/ File: (.+?)\n([\s\S]*?)(?=\/\/ File: |$)/g
    let match

    while ((match = filePattern.exec(code)) !== null) {
      const filename = match[1].trim()
      const content = match[2].trim()
      files[filename] = content
    }

    // If no files found, treat as single file
    if (Object.keys(files).length === 0) {
      files['main.js'] = code
    }

    return files
  }

  private generateInstructions(builderType: string, files: { [filename: string]: string }): string[] {
    const baseInstructions = [
      '1. Copy the generated code to your project',
      '2. Install any required dependencies',
      '3. Test the code locally',
      '4. Deploy to the appropriate platform'
    ]

    const builderSpecificInstructions = {
      ipa: [
        '1. Open Xcode and create a new iOS project',
        '2. Replace the default code with the generated Swift/Objective-C code',
        '3. Configure TrollStore compatibility settings',
        '4. Build and test on your iOS device',
        '5. Deploy using TrollStore installation method'
      ],
      printer: [
        '1. Save the OpenSCAD code to a .scad file',
        '2. Open in OpenSCAD software',
        '3. Render and check for errors',
        '4. Export to STL format',
        '5. Slice using your preferred slicer (Cura, PrusaSlicer, etc.)',
        '6. Print on your 3D printer'
      ],
      game: [
        '1. Set up your game development environment',
        '2. Import the generated code into your project',
        '3. Configure assets and resources',
        '4. Test gameplay mechanics',
        '5. Build for your target platform(s)',
        '6. Deploy to app stores or web'
      ],
      'ai-model': [
        '1. Set up Python environment with required packages',
        '2. Import the generated model code',
        '3. Prepare your training data',
        '4. Train and validate the model',
        '5. Deploy for inference',
        '6. Monitor performance and accuracy'
      ]
    }

    return builderSpecificInstructions[builderType] || baseInstructions
  }

  private getDeploymentUrl(builderType: string): string {
    const urlMap = {
      ipa: this.deploymentUrls['ipa-builder'],
      printer: this.deploymentUrls['printer-builder'],
      game: this.deploymentUrls['game-builder'],
      'ai-model': this.deploymentUrls['ai-models'],
      general: this.deploymentUrls['hub-ui']
    }

    return urlMap[builderType] || this.deploymentUrls['hub-ui']
  }

  // Get system status for dashboard
  getSystemStatus() {
    const authStatus = authService.getSystemStatus()
    
    return {
      ...authStatus,
      ensembleReady: this.isInitialized,
      deploymentUrls: this.deploymentUrls,
      features: {
        crossModelAI: true,
        unlimitedUsage: authStatus.unlimitedUsage,
        autoModelSelection: true,
        multiBuilderSupport: true,
        realTimeGeneration: true
      }
    }
  }

  // Builder-specific generation methods
  async generateIPA(prompt: string, sessionId?: string): Promise<BuilderResponse> {
    return this.generateCode({
      type: 'ipa',
      prompt,
      complexity: 'medium',
      sessionId
    })
  }

  async generatePrinter(prompt: string, sessionId?: string): Promise<BuilderResponse> {
    return this.generateCode({
      type: 'printer',
      prompt,
      complexity: 'medium',
      sessionId
    })
  }

  async generateGame(prompt: string, sessionId?: string): Promise<BuilderResponse> {
    return this.generateCode({
      type: 'game',
      prompt,
      complexity: 'medium',
      sessionId
    })
  }

  async generateAIModel(prompt: string, sessionId?: string): Promise<BuilderResponse> {
    return this.generateCode({
      type: 'ai-model',
      prompt,
      complexity: 'complex',
      sessionId
    })
  }
}

// Export singleton instance
export const perfectEnsemble = new PerfectEnsembleIntegration()
export default perfectEnsemble
