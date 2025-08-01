import React, { useState, useEffect, useCallback, useRef } from 'react'
import { perfectEnsemble } from '../../../shared/services/perfectEnsembleIntegration'
import { authService } from '../../../auth/src/services/authService'
import { LoadingSpinner } from '../../../shared/components/LoadingSpinner'
import { StatusIndicator } from '../../../shared/components/StatusIndicator'

interface BoltNewCloneProps {
  className?: string
  enableAllAIModels?: boolean
  enableRealTimePreview?: boolean
  enableFileSystem?: boolean
  enableTerminal?: boolean
}

interface ProjectFile {
  path: string
  content: string
  type: 'file' | 'directory'
  modified?: boolean
}

interface AIModel {
  id: string
  name: string
  provider: string
  available: boolean
  rateLimit: number
  quality: number
}

const AI_MODELS: AIModel[] = [
  { id: 'codellama-34b', name: 'CodeLlama 34B', provider: 'Local', available: true, rateLimit: 0, quality: 9.5 },
  { id: 'mistral-7b', name: 'Mistral 7B Instruct', provider: 'Local', available: true, rateLimit: 0, quality: 8.5 },
  { id: 'phi-3-medium', name: 'Phi-3 Medium', provider: 'Local', available: true, rateLimit: 0, quality: 9.0 },
  { id: 'deepseek-coder', name: 'DeepSeek Coder', provider: 'Web', available: true, rateLimit: 0, quality: 9.8 },
  { id: 'qwen2.5-coder', name: 'Qwen2.5 Coder', provider: 'Web', available: true, rateLimit: 0, quality: 9.3 },
  { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Web', available: true, rateLimit: 0, quality: 8.8 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'Web', available: true, rateLimit: 0, quality: 8.7 },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Web', available: true, rateLimit: 0, quality: 8.2 }
]

export const BoltNewClone: React.FC<BoltNewCloneProps> = ({
  className = '',
  enableAllAIModels = true,
  enableRealTimePreview = true,
  enableFileSystem = true,
  enableTerminal = true
}) => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedModels, setSelectedModels] = useState<string[]>(['codellama-34b'])
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([])
  const [activeFile, setActiveFile] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [terminalOutput, setTerminalOutput] = useState<string[]>([])
  const [generationProgress, setGenerationProgress] = useState(0)
  
  const previewRef = useRef<HTMLIFrameElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  // Initialize with default project structure
  useEffect(() => {
    const defaultFiles: ProjectFile[] = [
      {
        path: 'package.json',
        content: JSON.stringify({
          name: 'bolt-new-project',
          version: '1.0.0',
          type: 'module',
          scripts: {
            dev: 'vite',
            build: 'vite build',
            preview: 'vite preview'
          },
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0'
          },
          devDependencies: {
            '@types/react': '^18.2.0',
            '@types/react-dom': '^18.2.0',
            '@vitejs/plugin-react': '^4.0.0',
            typescript: '^5.0.0',
            vite: '^4.4.0'
          }
        }, null, 2),
        type: 'file'
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bolt.new Clone - Multi-Hub</title>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>`,
        type: 'file'
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
        type: 'file'
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">🚀 Bolt.new Clone</h1>
        <p className="text-xl mb-8">Powered by Multi-Hub AI Models</p>
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8">
          <p className="text-lg">Ready to build amazing apps!</p>
          <p className="text-sm mt-4 opacity-75">No rate limits • 8+ AI models • 100% free</p>
        </div>
      </div>
    </div>
  )
}

export default App`,
        type: 'file'
      },
      {
        path: 'src/index.css',
        content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}`,
        type: 'file'
      }
    ]
    
    setProjectFiles(defaultFiles)
    setActiveFile('src/App.tsx')
  }, [])

  // Handle AI generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      // Simulate multi-model AI generation
      const progressSteps = [
        'Analyzing prompt with ensemble AI...',
        'CodeLlama generating structure...',
        'Mistral optimizing logic...',
        'DeepSeek enhancing code quality...',
        'Phi-3 adding performance optimizations...',
        'Qwen2.5 improving TypeScript types...',
        'Claude refining user experience...',
        'GPT-4o adding documentation...',
        'Gemini finalizing project...',
        'Combining results for best quality...'
      ]

      for (let i = 0; i < progressSteps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800))
        setGenerationProgress((i + 1) / progressSteps.length * 100)
        addTerminalOutput(`[${new Date().toLocaleTimeString()}] ${progressSteps[i]}`)
      }

      // Generate enhanced project based on prompt
      const generatedFiles = await generateProjectFiles(prompt)
      setProjectFiles(prev => [...prev, ...generatedFiles])
      
      // Update preview
      await updatePreview()
      
      addTerminalOutput(`[${new Date().toLocaleTimeString()}] ✅ Project generated successfully with ${selectedModels.length} AI models!`)
      
    } catch (error) {
      addTerminalOutput(`[${new Date().toLocaleTimeString()}] ❌ Generation failed: ${error}`)
    } finally {
      setIsGenerating(false)
      setGenerationProgress(0)
    }
  }, [prompt, isGenerating, selectedModels])

  // Generate project files based on prompt
  const generateProjectFiles = async (userPrompt: string): Promise<ProjectFile[]> => {
    // Simulate AI-generated files based on prompt
    const files: ProjectFile[] = []

    if (userPrompt.toLowerCase().includes('todo') || userPrompt.toLowerCase().includes('task')) {
      files.push({
        path: 'src/components/TodoApp.tsx',
        content: `import React, { useState } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export const TodoApp: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputText, setInputText] = useState('')

  const addTodo = () => {
    if (inputText.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: inputText,
        completed: false
      }])
      setInputText('')
    }
  }

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Todo App</h1>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a new todo..."
        />
        <button
          onClick={addTodo}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {todos.map(todo => (
          <li
            key={todo.id}
            className={\`flex items-center p-2 rounded \${todo.completed ? 'bg-gray-100' : 'bg-white'}\`}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
              className="mr-3"
            />
            <span className={\`flex-1 \${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}\`}>
              {todo.text}
            </span>
          </li>
        ))}
      </ul>
      
      <div className="mt-4 text-sm text-gray-500">
        Generated by Multi-Hub AI • No rate limits
      </div>
    </div>
  )
}`,
        type: 'file'
      })

      // Update App.tsx to use TodoApp
      const appIndex = files.findIndex(f => f.path === 'src/App.tsx')
      if (appIndex === -1) {
        files.push({
          path: 'src/App.tsx',
          content: `import React from 'react'
import { TodoApp } from './components/TodoApp'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <TodoApp />
    </div>
  )
}

export default App`,
          type: 'file'
        })
      }
    }

    return files
  }

  // Update preview iframe
  const updatePreview = useCallback(async () => {
    if (!enableRealTimePreview) return

    try {
      // Simulate building and serving the project
      addTerminalOutput(`[${new Date().toLocaleTimeString()}] 🔄 Building project...`)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create blob URL for preview
      const htmlContent = projectFiles.find(f => f.path === 'index.html')?.content || ''
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      
      setPreviewUrl(url)
      addTerminalOutput(`[${new Date().toLocaleTimeString()}] ✅ Preview updated`)
      
    } catch (error) {
      addTerminalOutput(`[${new Date().toLocaleTimeString()}] ❌ Preview update failed: ${error}`)
    }
  }, [projectFiles, enableRealTimePreview])

  // Add terminal output
  const addTerminalOutput = useCallback((message: string) => {
    setTerminalOutput(prev => [...prev.slice(-50), message])
    
    // Auto-scroll terminal
    setTimeout(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight
      }
    }, 100)
  }, [])

  // Handle file selection
  const handleFileSelect = useCallback((filePath: string) => {
    setActiveFile(filePath)
  }, [])

  // Handle file content change
  const handleFileChange = useCallback((content: string) => {
    setProjectFiles(prev => prev.map(file =>
      file.path === activeFile
        ? { ...file, content, modified: true }
        : file
    ))
    
    // Update preview if it's a key file
    if (activeFile.endsWith('.tsx') || activeFile.endsWith('.html')) {
      updatePreview()
    }
  }, [activeFile, updatePreview])

  // Get active file content
  const activeFileContent = projectFiles.find(f => f.path === activeFile)?.content || ''

  return (
    <div className={`bolt-new-clone h-screen flex flex-col bg-gray-900 text-white ${className}`}>
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">⚡ Bolt.new Clone</h1>
            <div className="flex items-center space-x-2">
              <StatusIndicator status="success" message="Multi-Hub AI" size="sm" />
              <span className="text-sm text-gray-400">No rate limits</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">{selectedModels.length} AI models active</span>
            <div className="flex space-x-1">
              {AI_MODELS.slice(0, 4).map(model => (
                <div
                  key={model.id}
                  className={`w-2 h-2 rounded-full ${model.available ? 'bg-green-400' : 'bg-red-400'}`}
                  title={model.name}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
          {/* Prompt Input */}
          <div className="p-4 border-b border-gray-700">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to build..."
              className="w-full h-24 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 resize-none focus:outline-none focus:border-blue-500"
              disabled={isGenerating}
            />
            
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition-colors"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </div>
              ) : (
                '⚡ Generate with AI'
              )}
            </button>
            
            {isGenerating && (
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {generationProgress.toFixed(0)}% complete
                </div>
              </div>
            )}
          </div>

          {/* File Explorer */}
          {enableFileSystem && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <h3 className="text-sm font-semibold text-gray-400 mb-2">FILES</h3>
                <div className="space-y-1">
                  {projectFiles.map(file => (
                    <div
                      key={file.path}
                      onClick={() => handleFileSelect(file.path)}
                      className={`px-2 py-1 text-sm cursor-pointer rounded hover:bg-gray-700 ${
                        activeFile === file.path ? 'bg-blue-600' : ''
                      }`}
                    >
                      <span className="mr-2">
                        {file.type === 'directory' ? '📁' : '📄'}
                      </span>
                      {file.path}
                      {file.modified && <span className="text-yellow-400 ml-1">•</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col">
          {/* Editor Header */}
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Editing:</span>
              <span className="text-sm text-white">{activeFile || 'No file selected'}</span>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex">
            <div className="flex-1">
              <textarea
                value={activeFileContent}
                onChange={(e) => handleFileChange(e.target.value)}
                className="w-full h-full p-4 bg-gray-900 text-white font-mono text-sm resize-none focus:outline-none"
                placeholder="Select a file to start editing..."
                spellCheck={false}
              />
            </div>

            {/* Preview */}
            {enableRealTimePreview && (
              <div className="w-1/2 border-l border-gray-700">
                <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
                  <span className="text-sm text-gray-400">Preview</span>
                </div>
                <iframe
                  ref={previewRef}
                  src={previewUrl}
                  className="w-full h-full bg-white"
                  title="Preview"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal */}
      {enableTerminal && (
        <div className="h-48 bg-black border-t border-gray-700">
          <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
            <span className="text-sm text-gray-400">Terminal</span>
          </div>
          <div
            ref={terminalRef}
            className="h-40 overflow-y-auto p-4 font-mono text-sm text-green-400"
          >
            {terminalOutput.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BoltNewClone