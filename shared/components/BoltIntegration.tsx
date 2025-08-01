import React, { useState, useEffect, useRef } from 'react'
import { aiChain } from '../services/aiChain'
import { VSCodeIDE } from './VSCodeIDE'

interface BoltIntegrationProps {
  builderType: 'ipa' | 'printer' | 'game' | 'ai'
  onProjectGenerated?: (files: any) => void
  className?: string
}

interface GenerationStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  logs: string[]
}

export const BoltIntegration: React.FC<BoltIntegrationProps> = ({
  builderType,
  onProjectGenerated,
  className = ''
}) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<any>({})
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([])
  const [showIDE, setShowIDE] = useState(false)
  const [generationMode, setGenerationMode] = useState<'simple' | 'advanced'>('simple')

  // Quick start templates for each builder
  const quickTemplates = {
    'ipa': [
      { name: '📱 Simple Calculator', prompt: 'Create a simple iOS calculator app with basic arithmetic operations' },
      { name: '📝 Todo List App', prompt: 'Build a todo list app with Core Data persistence and clean UI' },
      { name: '🎮 Memory Game', prompt: 'Develop a memory card matching game with animations and scoring' },
      { name: '📷 Photo Editor', prompt: 'Create a photo editing app with filters and basic editing tools' },
      { name: '🌤️ Weather App', prompt: 'Build a weather app with location services and 5-day forecast' }
    ],
    'printer': [
      { name: '🔧 Phone Stand', prompt: 'Design a parametric phone stand that works for different phone sizes' },
      { name: '🏠 Miniature House', prompt: 'Create a detailed miniature house model with removable roof' },
      { name: '⚙️ Gear System', prompt: 'Design an interlocking gear system for educational purposes' },
      { name: '🎲 Custom Dice', prompt: 'Create custom dice with unique symbols instead of numbers' },
      { name: '🔌 Cable Organizer', prompt: 'Design a cable management system for desk organization' }
    ],
    'game': [
      { name: '🏃 Endless Runner', prompt: 'Create an endless runner game with obstacles and power-ups' },
      { name: '🧩 Puzzle Platformer', prompt: 'Build a puzzle platformer with physics-based mechanics' },
      { name: '🚀 Space Shooter', prompt: 'Develop a space shooter with enemy waves and upgrades' },
      { name: '🎯 Target Practice', prompt: 'Create a target practice game with different difficulty levels' },
      { name: '🌊 Ocean Adventure', prompt: 'Build an underwater exploration game with sea creatures' }
    ],
    'ai': [
      { name: '🤖 Chatbot', prompt: 'Create a conversational AI chatbot with personality and context memory' },
      { name: '🖼️ Image Classifier', prompt: 'Build an image classification model for recognizing objects' },
      { name: '📊 Data Analyzer', prompt: 'Develop a data analysis tool with visualization and insights' },
      { name: '🎵 Music Generator', prompt: 'Create an AI music generator that composes melodies' },
      { name: '📝 Text Summarizer', prompt: 'Build a text summarization tool for long documents' }
    ]
  }

  // Generate project from prompt
  const generateProject = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setShowIDE(false)
    setGeneratedFiles({})

    const steps: GenerationStep[] = [
      {
        id: 'analyze',
        name: 'Analyzing Requirements',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'structure',
        name: 'Creating Project Structure',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'generate',
        name: 'Generating Code Files',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'optimize',
        name: 'Optimizing & Validating',
        status: 'pending',
        progress: 0,
        logs: []
      },
      {
        id: 'finalize',
        name: 'Finalizing Project',
        status: 'pending',
        progress: 0,
        logs: []
      }
    ]

    setGenerationSteps(steps)

    try {
      // Step 1: Analyze requirements
      await executeStep('analyze', async (updateProgress, addLog) => {
        addLog('🔍 Analyzing project requirements...')
        updateProgress(30)
        
        const analysis = await aiChain.generate(`
          Analyze this ${builderType} project request: "${prompt}"
          
          Extract:
          1. Main functionality and features
          2. Technical requirements and dependencies
          3. File structure needed
          4. Key components to implement
          5. Complexity level (1-10)
          
          Return detailed analysis in JSON format.
        `, { builderType, temperature: 0.3 })
        
        addLog('✅ Requirements analysis completed')
        updateProgress(100)
        return analysis
      })

      // Step 2: Create project structure
      await executeStep('structure', async (updateProgress, addLog) => {
        addLog('🏗️ Creating project structure...')
        updateProgress(25)
        
        const structure = await aiChain.generate(`
          Create a complete project structure for ${builderType} project: "${prompt}"
          
          Include:
          - All necessary files and directories
          - Configuration files
          - Dependencies and imports
          - Build scripts if needed
          
          Return as JSON with file paths and descriptions.
        `, { builderType, temperature: 0.2 })
        
        addLog('📁 Project structure defined')
        updateProgress(100)
        return structure
      })

      // Step 3: Generate code files
      await executeStep('generate', async (updateProgress, addLog) => {
        addLog('⚡ Generating code files...')
        updateProgress(10)
        
        const files = await generateAllFiles(prompt, (progress, log) => {
          updateProgress(10 + (progress * 0.8))
          if (log) addLog(log)
        })
        
        addLog('✅ All files generated successfully')
        updateProgress(100)
        return files
      })

      // Step 4: Optimize and validate
      await executeStep('optimize', async (updateProgress, addLog) => {
        addLog('🔧 Optimizing code...')
        updateProgress(30)
        
        // Optimize generated code
        const optimizedFiles = await optimizeGeneratedFiles(generatedFiles)
        setGeneratedFiles(optimizedFiles)
        
        addLog('✅ Code optimization completed')
        updateProgress(100)
        return optimizedFiles
      })

      // Step 5: Finalize
      await executeStep('finalize', async (updateProgress, addLog) => {
        addLog('🎯 Finalizing project...')
        updateProgress(50)
        
        addLog('📦 Project ready for development')
        addLog('🚀 Opening in IDE...')
        updateProgress(100)
        
        setShowIDE(true)
        onProjectGenerated?.(generatedFiles)
      })

    } catch (error) {
      console.error('Generation failed:', error)
      // Mark current step as error
      setGenerationSteps(prev => prev.map(step => 
        step.status === 'running' 
          ? { ...step, status: 'error', logs: [...step.logs, `❌ Error: ${error.message}`] }
          : step
      ))
    } finally {
      setIsGenerating(false)
    }
  }

  // Execute a generation step
  const executeStep = async (
    stepId: string, 
    executor: (updateProgress: (p: number) => void, addLog: (log: string) => void) => Promise<any>
  ) => {
    // Mark step as running
    setGenerationSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: 'running' } : step
    ))

    const updateProgress = (progress: number) => {
      setGenerationSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, progress } : step
      ))
    }

    const addLog = (log: string) => {
      setGenerationSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, logs: [...step.logs, log] } : step
      ))
    }

    try {
      const result = await executor(updateProgress, addLog)
      
      // Mark step as completed
      setGenerationSteps(prev => prev.map(step => 
        step.id === stepId ? { ...step, status: 'completed', progress: 100 } : step
      ))

      return result
    } catch (error) {
      // Mark step as error
      setGenerationSteps(prev => prev.map(step => 
        step.id === stepId 
          ? { ...step, status: 'error', logs: [...step.logs, `❌ ${error.message}`] }
          : step
      ))
      throw error
    }
  }

  // Generate all project files
  const generateAllFiles = async (
    projectPrompt: string, 
    onProgress: (progress: number, log?: string) => void
  ) => {
    const fileTemplates = getFileTemplatesForBuilder(builderType)
    const files: any = {}
    
    let completed = 0
    const total = fileTemplates.length

    for (const template of fileTemplates) {
      onProgress((completed / total) * 100, `📝 Generating ${template.filename}...`)
      
      const filePrompt = `
        Generate ${template.description} for project: "${projectPrompt}"
        
        Requirements:
        - Follow ${builderType} best practices
        - Include proper imports and dependencies
        - Add comprehensive comments
        - Ensure code is production-ready
        
        File type: ${template.type}
        Template: ${template.template || 'None'}
      `
      
      const content = await aiChain.generate(filePrompt, {
        builderType,
        temperature: 0.4,
        maxTokens: 2000
      })
      
      files[template.filename] = {
        content,
        language: template.language,
        modified: false
      }
      
      completed++
      onProgress((completed / total) * 100, `✅ ${template.filename} generated`)
    }

    return files
  }

  // Optimize generated files
  const optimizeGeneratedFiles = async (files: any) => {
    const optimized = { ...files }
    
    for (const [filename, file] of Object.entries(files)) {
      if (filename.endsWith('.ts') || filename.endsWith('.tsx') || filename.endsWith('.swift')) {
        const optimizationPrompt = `
          Optimize this ${builderType} code for performance and best practices:
          
          ${file.content}
          
          Focus on:
          - Performance optimization
          - Error handling
          - Code organization
          - Security best practices
          - Memory management
        `
        
        try {
          const optimizedContent = await aiChain.generate(optimizationPrompt, {
            builderType,
            temperature: 0.2
          })
          
          optimized[filename] = {
            ...file,
            content: optimizedContent
          }
        } catch (error) {
          console.warn(`Failed to optimize ${filename}:`, error)
        }
      }
    }
    
    return optimized
  }

  // Get file templates for builder type
  const getFileTemplatesForBuilder = (type: string) => {
    const templates = {
      'ipa': [
        { filename: 'AppDelegate.swift', language: 'swift', type: 'iOS App Delegate', description: 'iOS application delegate with lifecycle methods' },
        { filename: 'ViewController.swift', language: 'swift', type: 'iOS View Controller', description: 'Main view controller with UI setup' },
        { filename: 'Info.plist', language: 'xml', type: 'iOS Configuration', description: 'iOS app configuration and permissions' },
        { filename: 'Main.storyboard', language: 'xml', type: 'iOS Storyboard', description: 'iOS interface storyboard' },
        { filename: 'LaunchScreen.storyboard', language: 'xml', type: 'iOS Launch Screen', description: 'iOS launch screen interface' }
      ],
      'printer': [
        { filename: 'model.scad', language: 'scad', type: 'OpenSCAD Model', description: 'Parametric 3D model in OpenSCAD' },
        { filename: 'config.json', language: 'json', type: '3D Print Config', description: '3D printer settings and parameters' },
        { filename: 'README.md', language: 'markdown', type: 'Documentation', description: 'Project documentation and print instructions' },
        { filename: 'slicer-settings.ini', language: 'ini', type: 'Slicer Config', description: 'Slicer configuration for optimal printing' }
      ],
      'game': [
        { filename: 'GameController.cs', language: 'csharp', type: 'Unity Script', description: 'Main game controller script' },
        { filename: 'PlayerController.cs', language: 'csharp', type: 'Unity Script', description: 'Player movement and input controller' },
        { filename: 'GameManager.cs', language: 'csharp', type: 'Unity Script', description: 'Game state and logic manager' },
        { filename: 'UIManager.cs', language: 'csharp', type: 'Unity Script', description: 'User interface management' },
        { filename: 'GameScene.unity', language: 'yaml', type: 'Unity Scene', description: 'Main game scene configuration' }
      ],
      'ai': [
        { filename: 'model.py', language: 'python', type: 'AI Model', description: 'Machine learning model implementation' },
        { filename: 'train.py', language: 'python', type: 'Training Script', description: 'Model training and evaluation script' },
        { filename: 'inference.py', language: 'python', type: 'Inference Script', description: 'Model inference and prediction script' },
        { filename: 'config.yaml', language: 'yaml', type: 'Configuration', description: 'Model and training configuration' },
        { filename: 'requirements.txt', language: 'text', type: 'Dependencies', description: 'Python package dependencies' }
      ]
    }
    
    return templates[type] || []
  }

  return (
    <div className={`bolt-integration h-full ${className}`}>
      {!showIDE ? (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-2">
              🚀 {builderType.toUpperCase()} Builder - Bolt.new Style
            </h2>
            <p className="text-gray-300">
              Describe your project and watch it come to life with AI-powered generation
            </p>
          </div>

          {/* Quick Templates */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-medium text-white mb-3">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {quickTemplates[builderType].map((template, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(template.prompt)}
                  className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg text-left transition-colors"
                >
                  <div className="font-medium text-white">{template.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{template.prompt.substring(0, 60)}...</div>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex space-x-4">
              <div className="flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={`Describe your ${builderType} project in detail...`}
                  className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <select
                  value={generationMode}
                  onChange={(e) => setGenerationMode(e.target.value as any)}
                  className="px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="simple">Simple Mode</option>
                  <option value="advanced">Advanced Mode</option>
                </select>
                <button
                  onClick={generateProject}
                  disabled={!prompt.trim() || isGenerating}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                >
                  {isGenerating ? '🤖 Generating...' : '🚀 Generate Project'}
                </button>
              </div>
            </div>
          </div>

          {/* Generation Progress */}
          {generationSteps.length > 0 && (
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-4">Generation Progress</h3>
              <div className="space-y-4">
                {generationSteps.map((step) => (
                  <div key={step.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center text-xs
                          ${step.status === 'completed' ? 'bg-green-600 text-white' :
                            step.status === 'running' ? 'bg-blue-600 text-white' :
                            step.status === 'error' ? 'bg-red-600 text-white' :
                            'bg-gray-600 text-gray-300'}
                        `}>
                          {step.status === 'completed' ? '✓' :
                           step.status === 'running' ? '⟳' :
                           step.status === 'error' ? '✗' : '○'}
                        </div>
                        <span className="text-white font-medium">{step.name}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{step.progress}%</span>
                    </div>
                    
                    {step.progress > 0 && (
                      <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            step.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    )}
                    
                    {step.logs.length > 0 && (
                      <div className="text-sm text-gray-300 space-y-1">
                        {step.logs.slice(-3).map((log, index) => (
                          <div key={index}>{log}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="h-full">
          <VSCodeIDE
            builderType={builderType}
            initialFiles={generatedFiles}
            onFileChange={setGeneratedFiles}
            onBuild={() => console.log('Build triggered')}
          />
        </div>
      )}
    </div>
  )
}

export default BoltIntegration
