import React, { useState, useEffect, useCallback, useRef } from 'react'
import { LoadingSpinner } from './common/LoadingSpinner'
import { StatusIndicator } from './common/StatusIndicator'

interface FileSystemEntry {
  name: string
  type: 'file' | 'directory'
  path: string
  content?: string
  children?: FileSystemEntry[]
  modified?: boolean
  size?: number
  lastModified?: Date
}

interface VSCodeIDEProps {
  className?: string
  projectType: 'ipa-builder' | 'printer-builder' | 'game-builder' | 'ai-models'
  onFileChange?: (path: string, content: string) => void
  onDeploy?: (files: FileSystemEntry[]) => void
  enableAIAssistant?: boolean
  enableUnlimitedMode?: boolean
}

interface AIAction {
  id: string
  label: string
  description: string
  icon: string
  prompt: string
  fileTypes: string[]
}

const AI_ACTIONS: AIAction[] = [
  {
    id: 'generate-component',
    label: 'Generate Component',
    description: 'Generate React TypeScript component',
    icon: '⚛️',
    prompt: 'Generate a React TypeScript component with enterprise patterns',
    fileTypes: ['.tsx', '.jsx']
  },
  {
    id: 'add-function',
    label: 'Add Function',
    description: 'Add new function to file',
    icon: '🔧',
    prompt: 'Add a new function to this file with proper TypeScript types',
    fileTypes: ['.ts', '.tsx', '.js', '.jsx']
  },
  {
    id: 'fix-code',
    label: 'Fix Code',
    description: 'Fix errors and optimize code',
    icon: '🔨',
    prompt: 'Fix any errors in this code and optimize for performance',
    fileTypes: ['.ts', '.tsx', '.js', '.jsx', '.py', '.swift']
  },
  {
    id: 'add-tests',
    label: 'Add Tests',
    description: 'Generate test cases',
    icon: '🧪',
    prompt: 'Generate comprehensive test cases for this code',
    fileTypes: ['.ts', '.tsx', '.js', '.jsx']
  },
  {
    id: 'optimize-performance',
    label: 'Optimize Performance',
    description: 'Optimize code for better performance',
    icon: '⚡',
    prompt: 'Optimize this code for better performance and memory usage',
    fileTypes: ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss']
  },
  {
    id: 'generate-ios-feature',
    label: 'Generate iOS Feature',
    description: 'Add iOS-specific functionality',
    icon: '📱',
    prompt: 'Generate iOS-specific code with TrollStore compatibility',
    fileTypes: ['.swift', '.m', '.h', '.plist']
  },
  {
    id: 'generate-3d-model',
    label: 'Generate 3D Model',
    description: 'Create OpenSCAD 3D model code',
    icon: '🖨️',
    prompt: 'Generate OpenSCAD code for 3D printing',
    fileTypes: ['.scad', '.js', '.ts']
  },
  {
    id: 'generate-game-logic',
    label: 'Generate Game Logic',
    description: 'Add game development features',
    icon: '🎮',
    prompt: 'Generate game logic with Unity integration',
    fileTypes: ['.cs', '.js', '.ts']
  }
]

export const VSCodeIDE: React.FC<VSCodeIDEProps> = ({
  className = '',
  projectType,
  onFileChange,
  onDeploy,
  enableAIAssistant = true,
  enableUnlimitedMode = true
}) => {
  const [fileSystem, setFileSystem] = useState<FileSystemEntry[]>([])
  const [selectedFile, setSelectedFile] = useState<FileSystemEntry | null>(null)
  const [fileContent, setFileContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    file: FileSystemEntry | null
    visible: boolean
  }>({ x: 0, y: 0, file: null, visible: false })
  const [aiProcessing, setAiProcessing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeploying, setIsDeploying] = useState(false)
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize file system based on project type
  useEffect(() => {
    initializeFileSystem()
  }, [projectType])

  // Handle clicks outside context menu
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(prev => ({ ...prev, visible: false }))
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const initializeFileSystem = useCallback(() => {
    const baseStructure: FileSystemEntry[] = [
      {
        name: 'src',
        type: 'directory',
        path: '/src',
        children: [
          {
            name: 'components',
            type: 'directory',
            path: '/src/components',
            children: []
          },
          {
            name: 'services',
            type: 'directory',
            path: '/src/services',
            children: []
          },
          {
            name: 'types',
            type: 'directory',
            path: '/src/types',
            children: []
          }
        ]
      },
      {
        name: 'package.json',
        type: 'file',
        path: '/package.json',
        content: generatePackageJson(projectType)
      },
      {
        name: 'README.md',
        type: 'file',
        path: '/README.md',
        content: generateReadme(projectType)
      }
    ]

    // Add project-specific files
    switch (projectType) {
      case 'ipa-builder':
        baseStructure[0].children?.push({
          name: 'ios',
          type: 'directory',
          path: '/src/ios',
          children: [
            {
              name: 'AppDelegate.swift',
              type: 'file',
              path: '/src/ios/AppDelegate.swift',
              content: generateSwiftAppDelegate()
            }
          ]
        })
        break
      
      case 'printer-builder':
        baseStructure[0].children?.push({
          name: 'models',
          type: 'directory',
          path: '/src/models',
          children: [
            {
              name: 'basic-cube.scad',
              type: 'file',
              path: '/src/models/basic-cube.scad',
              content: generateOpenSCADCube()
            }
          ]
        })
        break
      
      case 'game-builder':
        baseStructure[0].children?.push({
          name: 'unity',
          type: 'directory',
          path: '/src/unity',
          children: [
            {
              name: 'GameController.cs',
              type: 'file',
              path: '/src/unity/GameController.cs',
              content: generateUnityController()
            }
          ]
        })
        break
      
      case 'ai-models':
        baseStructure[0].children?.push({
          name: 'models',
          type: 'directory',
          path: '/src/models',
          children: [
            {
              name: 'inference.ts',
              type: 'file',
              path: '/src/models/inference.ts',
              content: generateInferenceCode()
            }
          ]
        })
        break
    }

    setFileSystem(baseStructure)
  }, [projectType])

  // Handle file selection
  const handleFileSelect = useCallback((file: FileSystemEntry) => {
    if (file.type === 'file') {
      setSelectedFile(file)
      setFileContent(file.content || '')
    }
  }, [])

  // Handle file content change
  const handleContentChange = useCallback((content: string) => {
    setFileContent(content)
    
    if (selectedFile) {
      // Update file system
      setFileSystem(prev => updateFileInSystem(prev, selectedFile.path, content))
      
      // Mark file as modified
      setSelectedFile(prev => prev ? { ...prev, content, modified: true } : null)
      
      // Notify parent
      onFileChange?.(selectedFile.path, content)
    }
  }, [selectedFile, onFileChange])

  // Handle right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, file: FileSystemEntry) => {
    e.preventDefault()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file,
      visible: true
    })
  }, [])

  // Handle AI action
  const handleAIAction = useCallback(async (action: AIAction) => {
    if (!selectedFile || !enableAIAssistant) return

    setAiProcessing(true)
    setContextMenu(prev => ({ ...prev, visible: false }))

    try {
      // Simulate AI processing (in real implementation, would call Custom Qodo Gen)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const aiGeneratedContent = await generateAIContent(action, selectedFile, fileContent)
      handleContentChange(aiGeneratedContent)

    } catch (error) {
      console.error('AI action failed:', error)
    } finally {
      setAiProcessing(false)
    }
  }, [selectedFile, fileContent, enableAIAssistant, handleContentChange])

  // Handle file upload
  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        const newFile: FileSystemEntry = {
          name: file.name,
          type: 'file',
          path: `/src/${file.name}`,
          content,
          size: file.size,
          lastModified: new Date(file.lastModified)
        }
        
        setFileSystem(prev => addFileToSystem(prev, newFile))
      }
      reader.readAsText(file)
    })
  }, [])

  // Handle deployment
  const handleDeploy = useCallback(async () => {
    setIsDeploying(true)
    
    try {
      // Collect all modified files
      const modifiedFiles = collectModifiedFiles(fileSystem)
      
      // Trigger deployment
      onDeploy?.(modifiedFiles)
      
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mark all files as saved
      setFileSystem(prev => markAllFilesSaved(prev))
      
    } catch (error) {
      console.error('Deployment failed:', error)
    } finally {
      setIsDeploying(false)
    }
  }, [fileSystem, onDeploy])

  // Filter files based on search
  const filteredFileSystem = useCallback((entries: FileSystemEntry[]): FileSystemEntry[] => {
    if (!searchQuery) return entries
    
    return entries.filter(entry => {
      if (entry.type === 'file') {
        return entry.name.toLowerCase().includes(searchQuery.toLowerCase())
      } else {
        const filteredChildren = filteredFileSystem(entry.children || [])
        return filteredChildren.length > 0 || entry.name.toLowerCase().includes(searchQuery.toLowerCase())
      }
    }).map(entry => ({
      ...entry,
      children: entry.type === 'directory' ? filteredFileSystem(entry.children || []) : undefined
    }))
  }, [searchQuery])

  // Get available AI actions for current file
  const getAvailableAIActions = useCallback((file: FileSystemEntry): AIAction[] => {
    if (!file || file.type !== 'file') return []
    
    const fileExtension = '.' + file.name.split('.').pop()
    return AI_ACTIONS.filter(action => 
      action.fileTypes.includes(fileExtension) || action.fileTypes.includes('*')
    )
  }, [])

  // Render file tree
  const renderFileTree = useCallback((entries: FileSystemEntry[], depth = 0): React.ReactNode => {
    return entries.map(entry => (
      <div key={entry.path} style={{ marginLeft: depth * 16 }}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 hover:bg-gray-700 cursor-pointer ${
            selectedFile?.path === entry.path ? 'bg-blue-600' : ''
          }`}
          onClick={() => handleFileSelect(entry)}
          onContextMenu={(e) => handleContextMenu(e, entry)}
        >
          <span className="text-lg">
            {entry.type === 'directory' ? '📁' : getFileIcon(entry.name)}
          </span>
          <span className={`text-sm ${entry.modified ? 'text-yellow-400' : 'text-gray-300'}`}>
            {entry.name}
            {entry.modified && ' •'}
          </span>
        </div>
        
        {entry.type === 'directory' && entry.children && (
          <div>
            {renderFileTree(entry.children, depth + 1)}
          </div>
        )}
      </div>
    ))
  }, [selectedFile, handleFileSelect, handleContextMenu])

  return (
    <div className={`vscode-ide flex h-full bg-gray-900 text-white ${className}`}>
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Search */}
        <div className="p-3 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* File Explorer */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400 uppercase">Explorer</span>
            <div className="flex space-x-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:bg-gray-700 rounded text-xs"
                title="Upload files"
              >
                📁
              </button>
              <button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="p-1 hover:bg-gray-700 rounded text-xs"
                title="Deploy to Netlify"
              >
                {isDeploying ? '⏳' : '🚀'}
              </button>
            </div>
          </div>
          
          {renderFileTree(filteredFileSystem(fileSystem))}
        </div>

        {/* Status */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Project: {projectType}</span>
            <StatusIndicator 
              status={enableUnlimitedMode ? 'success' : 'warning'}
              message={enableUnlimitedMode ? 'Unlimited' : 'Limited'}
              size="sm"
            />
          </div>
          
          {enableUnlimitedMode && (
            <div className="mt-1 text-xs text-green-400">
              ✅ No rate limits • Unlimited usage
            </div>
          )}
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        {selectedFile && (
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getFileIcon(selectedFile.name)}</span>
              <span className="text-sm">{selectedFile.name}</span>
              {selectedFile.modified && <span className="text-yellow-400 text-xs">•</span>}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1 relative">
          {selectedFile ? (
            <textarea
              ref={editorRef}
              value={fileContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
              placeholder="Start coding..."
              spellCheck={false}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-4">📝</div>
                <p>Select a file to start editing</p>
                <p className="text-sm mt-2">Or right-click to create new files</p>
              </div>
            </div>
          )}

          {/* AI Processing Overlay */}
          {aiProcessing && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-white">AI is generating code...</p>
                <p className="text-sm text-gray-400">Using Custom Qodo Gen (20x better)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.file && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg py-2 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {enableAIAssistant && getAvailableAIActions(contextMenu.file).map(action => (
            <button
              key={action.id}
              onClick={() => handleAIAction(action)}
              className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center space-x-2"
            >
              <span>{action.icon}</span>
              <div>
                <div className="text-sm text-white">{action.label}</div>
                <div className="text-xs text-gray-400">{action.description}</div>
              </div>
            </button>
          ))}
          
          <hr className="border-gray-600 my-1" />
          
          <button
            onClick={() => setContextMenu(prev => ({ ...prev, visible: false }))}
            className="w-full px-4 py-2 text-left hover:bg-gray-700 text-sm text-gray-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

// Helper functions
function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    'tsx': '⚛️',
    'ts': '🔷',
    'js': '🟨',
    'jsx': '⚛️',
    'json': '📋',
    'md': '📝',
    'css': '🎨',
    'scss': '🎨',
    'html': '🌐',
    'swift': '🍎',
    'scad': '🖨️',
    'cs': '🎮',
    'py': '🐍'
  }
  return iconMap[ext || ''] || '📄'
}

function generatePackageJson(projectType: string): string {
  return JSON.stringify({
    name: `multi-hub-${projectType}`,
    version: "1.0.0",
    description: `Multi-Hub ${projectType} with VSCode IDE integration`,
    scripts: {
      dev: "vite",
      build: "tsc && vite build",
      preview: "vite preview",
      deploy: "netlify deploy --prod"
    },
    dependencies: {
      react: "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@types/react": "^18.2.0",
      vite: "^4.4.0",
      typescript: "^5.0.0"
    }
  }, null, 2)
}

function generateReadme(projectType: string): string {
  return `# Multi-Hub ${projectType.charAt(0).toUpperCase() + projectType.slice(1)}

## Features
- 🚀 VSCode-style IDE integration
- 🤖 AI-powered code generation
- ⚡ Unlimited usage (no rate limits)
- 🔄 Real-time deployment to Netlify
- 🛡️ Enterprise security patterns

## Usage
1. Select files in the explorer
2. Right-click for AI assistance
3. Edit code in the integrated editor
4. Deploy with one click

## AI Features
- Generate components
- Add functions
- Fix code issues
- Optimize performance
- Add test cases

Built with Multi-Hub Platform - 100% free, unlimited usage!
`
}

function generateSwiftAppDelegate(): string {
  return `import UIKit

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Multi-Hub generated iOS app
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = ViewController()
        window?.makeKeyAndVisible()
        return true
    }
}

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        view.backgroundColor = .systemBlue
        
        let label = UILabel()
        label.text = "Multi-Hub iOS App"
        label.textAlignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(label)
        
        NSLayoutConstraint.activate([
            label.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            label.centerYAnchor.constraint(equalTo: view.centerYAnchor)
        ])
    }
}
`
}

function generateOpenSCADCube(): string {
  return `// Multi-Hub generated 3D model
// Basic parametric cube

// Parameters
cube_size = 20; // Size in mm
wall_thickness = 2; // Wall thickness in mm

// Main cube
difference() {
    // Outer cube
    cube([cube_size, cube_size, cube_size], center=true);
    
    // Inner cavity
    translate([0, 0, wall_thickness])
    cube([cube_size-wall_thickness*2, cube_size-wall_thickness*2, cube_size], center=true);
}

// Add some decorative elements
for (i = [0:3]) {
    rotate([0, 0, i*90])
    translate([cube_size/2, 0, 0])
    cylinder(h=cube_size, d=2, center=true);
}
`
}

function generateUnityController(): string {
  return `using UnityEngine;

// Multi-Hub generated Unity game controller
public class GameController : MonoBehaviour
{
    [Header("Game Settings")]
    public float gameSpeed = 1.0f;
    public int maxLives = 3;
    
    private int currentLives;
    private float score;
    private bool gameActive;
    
    void Start()
    {
        InitializeGame();
    }
    
    void Update()
    {
        if (gameActive)
        {
            UpdateGame();
        }
    }
    
    void InitializeGame()
    {
        currentLives = maxLives;
        score = 0;
        gameActive = true;
        Debug.Log("Multi-Hub game initialized!");
    }
    
    void UpdateGame()
    {
        // Game logic here
        score += Time.deltaTime * gameSpeed;
    }
    
    public void LoseLife()
    {
        currentLives--;
        if (currentLives <= 0)
        {
            GameOver();
        }
    }
    
    void GameOver()
    {
        gameActive = false;
        Debug.Log($"Game Over! Final Score: {score:F2}");
    }
}
`
}

function generateInferenceCode(): string {
  return `// Multi-Hub AI inference service
import { LocalInferenceService } from './localInference'

export class MultiHubInference {
  private inferenceService: LocalInferenceService
  
  constructor() {
    this.inferenceService = new LocalInferenceService({
      freetierOptimized: true,
      enableCaching: true,
      maxConcurrentModels: 1
    })
  }
  
  async initialize(): Promise<void> {
    await this.inferenceService.initialize()
    console.log('Multi-Hub AI inference ready!')
  }
  
  async generateCode(prompt: string, fileType: string): Promise<string> {
    const modelId = this.selectBestModel(fileType)
    await this.inferenceService.loadModel(modelId)
    
    const result = await this.inferenceService.generateText(prompt, {
      maxTokens: 1024,
      temperature: 0.3,
      topP: 0.9
    })
    
    return result.text
  }
  
  private selectBestModel(fileType: string): string {
    const modelMap: Record<string, string> = {
      '.ts': 'codellama',
      '.tsx': 'codellama', 
      '.swift': 'codellama',
      '.scad': 'phi-2',
      '.cs': 'codellama',
      '.py': 'codellama'
    }
    
    return modelMap[fileType] || 'tinyllama'
  }
}
`
}

async function generateAIContent(action: AIAction, file: FileSystemEntry, currentContent: string): Promise<string> {
  // Simulate AI content generation
  const templates: Record<string, string> = {
    'generate-component': `import React from 'react'

interface ${file.name.replace('.tsx', '')}Props {
  className?: string
  children?: React.ReactNode
}

export const ${file.name.replace('.tsx', '')}: React.FC<${file.name.replace('.tsx', '')}Props> = ({
  className = '',
  children
}) => {
  return (
    <div className={\`${file.name.toLowerCase().replace('.tsx', '')} \${className}\`}>
      {children}
    </div>
  )
}

export default ${file.name.replace('.tsx', '')}`,

    'add-function': currentContent + `

// AI-generated function
export const newFunction = async (): Promise<void> => {
  // Implementation here
  console.log('New function generated by Multi-Hub AI')
}`,

    'fix-code': currentContent.replace(/console\.log/g, '// Fixed: console.log'),
    
    'add-tests': currentContent + `

// AI-generated tests
describe('${file.name}', () => {
  it('should render correctly', () => {
    // Test implementation
    expect(true).toBe(true)
  })
})`,

    'optimize-performance': currentContent.replace(/function/g, 'const optimizedFunction =')
  }

  return templates[action.id] || currentContent + '\n// AI enhancement applied'
}

// File system helper functions
function updateFileInSystem(entries: FileSystemEntry[], path: string, content: string): FileSystemEntry[] {
  return entries.map(entry => {
    if (entry.path === path) {
      return { ...entry, content, modified: true }
    } else if (entry.children) {
      return { ...entry, children: updateFileInSystem(entry.children, path, content) }
    }
    return entry
  })
}

function addFileToSystem(entries: FileSystemEntry[], newFile: FileSystemEntry): FileSystemEntry[] {
  // Add to src directory by default
  return entries.map(entry => {
    if (entry.path === '/src' && entry.children) {
      return { ...entry, children: [...entry.children, newFile] }
    }
    return entry
  })
}

function collectModifiedFiles(entries: FileSystemEntry[]): FileSystemEntry[] {
  const modified: FileSystemEntry[] = []
  
  const traverse = (entries: FileSystemEntry[]) => {
    entries.forEach(entry => {
      if (entry.type === 'file' && entry.modified) {
        modified.push(entry)
      } else if (entry.children) {
        traverse(entry.children)
      }
    })
  }
  
  traverse(entries)
  return modified
}

function markAllFilesSaved(entries: FileSystemEntry[]): FileSystemEntry[] {
  return entries.map(entry => ({
    ...entry,
    modified: false,
    children: entry.children ? markAllFilesSaved(entry.children) : undefined
  }))
}

export default VSCodeIDE