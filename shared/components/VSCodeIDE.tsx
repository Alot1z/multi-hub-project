import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as monaco from 'monaco-editor'
import { aiChain } from '../services/aiChain'

interface FileStructure {
  [filename: string]: {
    content: string
    language: string
    modified?: boolean
  }
}

interface VSCodeIDEProps {
  builderType: 'ipa' | 'printer' | 'game' | 'ai'
  initialFiles?: FileStructure
  onFileChange?: (files: FileStructure) => void
  onBuild?: () => void
  className?: string
}

interface ContextMenuItem {
  label: string
  icon?: string
  action: (selection?: string) => void
  submenu?: ContextMenuItem[]
  separator?: boolean
}

export const VSCodeIDE: React.FC<VSCodeIDEProps> = ({
  builderType,
  initialFiles = {},
  onFileChange,
  onBuild,
  className = ''
}) => {
  const [files, setFiles] = useState<FileStructure>(initialFiles)
  const [activeFile, setActiveFile] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null)
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<HTMLDivElement>(null)

  // Initialize Monaco Editor
  useEffect(() => {
    if (monacoRef.current && !editorRef.current) {
      editorRef.current = monaco.editor.create(monacoRef.current, {
        value: files[activeFile]?.content || '',
        language: files[activeFile]?.language || 'typescript',
        theme: 'vs-dark',
        fontSize: 14,
        minimap: { enabled: true },
        wordWrap: 'on',
        automaticLayout: true,
        contextmenu: false, // We'll handle this ourselves
        scrollBeyondLastLine: false,
        renderLineHighlight: 'all',
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        automaticLayout: true
      })

      // Handle content changes
      editorRef.current.onDidChangeModelContent(() => {
        if (activeFile && editorRef.current) {
          const newContent = editorRef.current.getValue()
          updateFileContent(activeFile, newContent)
        }
      })

      // Handle right-click context menu
      editorRef.current.onContextMenu((e) => {
        e.event.preventDefault()
        const selection = editorRef.current?.getModel()?.getValueInRange(editorRef.current.getSelection()!)
        showContextMenu(e.event.posx, e.event.posy, selection)
      })
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
        editorRef.current = null
      }
    }
  }, [])

  // Update editor when active file changes
  useEffect(() => {
    if (editorRef.current && activeFile && files[activeFile]) {
      const model = monaco.editor.createModel(
        files[activeFile].content,
        files[activeFile].language
      )
      editorRef.current.setModel(model)
    }
  }, [activeFile, files])

  // Update file content
  const updateFileContent = useCallback((filename: string, content: string) => {
    setFiles(prev => {
      const updated = {
        ...prev,
        [filename]: {
          ...prev[filename],
          content,
          modified: true
        }
      }
      onFileChange?.(updated)
      return updated
    })
  }, [onFileChange])

  // Create new file
  const createNewFile = useCallback((filename: string, template?: string) => {
    const language = getLanguageFromFilename(filename)
    const content = template || getDefaultTemplate(language, builderType)
    
    setFiles(prev => ({
      ...prev,
      [filename]: { content, language, modified: false }
    }))
    setActiveFile(filename)
  }, [builderType])

  // Delete file
  const deleteFile = useCallback((filename: string) => {
    setFiles(prev => {
      const updated = { ...prev }
      delete updated[filename]
      return updated
    })
    if (activeFile === filename) {
      const remainingFiles = Object.keys(files).filter(f => f !== filename)
      setActiveFile(remainingFiles[0] || '')
    }
  }, [activeFile, files])

  // AI-powered code generation
  const generateCode = useCallback(async (prompt: string, insertAtCursor = false) => {
    setIsGenerating(true)
    try {
      const builderContext = getBuilderContext(builderType)
      const fullPrompt = `${builderContext}\n\nGenerate code for: ${prompt}`
      
      const generatedCode = await aiChain.generate(fullPrompt)
      
      if (insertAtCursor && editorRef.current) {
        const selection = editorRef.current.getSelection()
        const operation = {
          range: selection!,
          text: generatedCode,
          forceMoveMarkers: true
        }
        editorRef.current.executeEdits('ai-generation', [operation])
      } else {
        return generatedCode
      }
    } catch (error) {
      console.error('Code generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [builderType])

  // Context menu items
  const getContextMenuItems = useCallback((selection?: string): ContextMenuItem[] => {
    return [
      {
        label: '🤖 Generate Function',
        action: () => generateCode(`Generate a function for: ${selection || 'new functionality'}`, true)
      },
      {
        label: '✨ Optimize Code',
        action: async () => {
          if (selection) {
            const optimized = await generateCode(`Optimize this code: ${selection}`)
            if (optimized && editorRef.current) {
              const selectionRange = editorRef.current.getSelection()
              editorRef.current.executeEdits('optimization', [{
                range: selectionRange!,
                text: optimized,
                forceMoveMarkers: true
              }])
            }
          }
        }
      },
      {
        label: '📝 Add Comments',
        action: async () => {
          if (selection) {
            const commented = await generateCode(`Add detailed comments to: ${selection}`)
            if (commented && editorRef.current) {
              const selectionRange = editorRef.current.getSelection()
              editorRef.current.executeEdits('commenting', [{
                range: selectionRange!,
                text: commented,
                forceMoveMarkers: true
              }])
            }
          }
        }
      },
      {
        label: '🔧 Fix Errors',
        action: async () => {
          if (selection) {
            const fixed = await generateCode(`Fix errors in this code: ${selection}`)
            if (fixed && editorRef.current) {
              const selectionRange = editorRef.current.getSelection()
              editorRef.current.executeEdits('error-fix', [{
                range: selectionRange!,
                text: fixed,
                forceMoveMarkers: true
              }])
            }
          }
        }
      },
      { separator: true },
      {
        label: '📄 Create New File',
        submenu: getNewFileMenuItems()
      },
      {
        label: '🚀 Build Project',
        action: () => onBuild?.()
      }
    ]
  }, [generateCode, onBuild])

  // New file menu items based on builder type
  const getNewFileMenuItems = useCallback((): ContextMenuItem[] => {
    const commonItems = [
      { label: 'TypeScript File', action: () => createNewFile('new.ts') },
      { label: 'JavaScript File', action: () => createNewFile('new.js') },
      { label: 'JSON Config', action: () => createNewFile('config.json') },
      { label: 'Markdown Doc', action: () => createNewFile('README.md') }
    ]

    const builderSpecific = {
      'ipa': [
        { label: 'Swift File', action: () => createNewFile('ViewController.swift') },
        { label: 'Objective-C File', action: () => createNewFile('AppDelegate.m') },
        { label: 'Info.plist', action: () => createNewFile('Info.plist') },
        { label: 'Storyboard', action: () => createNewFile('Main.storyboard') }
      ],
      'printer': [
        { label: 'OpenSCAD File', action: () => createNewFile('model.scad') },
        { label: 'G-code File', action: () => createNewFile('print.gcode') },
        { label: 'STL Model', action: () => createNewFile('model.stl') },
        { label: 'Slicer Config', action: () => createNewFile('slicer.ini') }
      ],
      'game': [
        { label: 'C# Script', action: () => createNewFile('GameController.cs') },
        { label: 'Unity Scene', action: () => createNewFile('GameScene.unity') },
        { label: 'Shader File', action: () => createNewFile('CustomShader.shader') },
        { label: 'Animation Controller', action: () => createNewFile('PlayerAnimator.controller') }
      ],
      'ai': [
        { label: 'Python Model', action: () => createNewFile('model.py') },
        { label: 'Training Script', action: () => createNewFile('train.py') },
        { label: 'Config YAML', action: () => createNewFile('config.yaml') },
        { label: 'Requirements', action: () => createNewFile('requirements.txt') }
      ]
    }

    return [...builderSpecific[builderType], ...commonItems]
  }, [builderType, createNewFile])

  // Show context menu
  const showContextMenu = useCallback((x: number, y: number, selection?: string) => {
    setContextMenu({
      x,
      y,
      items: getContextMenuItems(selection)
    })
  }, [getContextMenuItems])

  // Hide context menu
  const hideContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  // File explorer component
  const FileExplorer = () => (
    <div className="h-full bg-gray-900 border-r border-gray-700">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Explorer</h3>
      </div>
      <div className="p-2">
        {Object.keys(files).map(filename => (
          <div
            key={filename}
            className={`
              flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-800
              ${activeFile === filename ? 'bg-blue-600 text-white' : 'text-gray-300'}
            `}
            onClick={() => setActiveFile(filename)}
            onContextMenu={(e) => {
              e.preventDefault()
              showContextMenu(e.clientX, e.clientY)
            }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xs">{getFileIcon(filename)}</span>
              <span className="text-sm">{filename}</span>
              {files[filename].modified && <span className="text-xs text-yellow-400">●</span>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                deleteFile(filename)
              }}
              className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100"
            >
              ×
            </button>
          </div>
        ))}
        
        <button
          onClick={() => createNewFile('untitled.txt')}
          className="w-full mt-2 p-2 text-sm text-gray-400 border border-dashed border-gray-600 rounded hover:border-gray-500 hover:text-gray-300"
        >
          + New File
        </button>
      </div>
    </div>
  )

  // Tab bar component
  const TabBar = () => (
    <div className="h-10 bg-gray-800 border-b border-gray-700 flex overflow-x-auto">
      {Object.keys(files).map(filename => (
        <div
          key={filename}
          className={`
            flex items-center px-3 py-2 border-r border-gray-700 cursor-pointer min-w-0
            ${activeFile === filename ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'}
          `}
          onClick={() => setActiveFile(filename)}
        >
          <span className="text-xs mr-2">{getFileIcon(filename)}</span>
          <span className="text-sm truncate">{filename}</span>
          {files[filename].modified && <span className="text-xs text-yellow-400 ml-1">●</span>}
          <button
            onClick={(e) => {
              e.stopPropagation()
              deleteFile(filename)
            }}
            className="ml-2 text-gray-500 hover:text-red-400"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )

  // AI Assistant Panel
  const AIAssistantPanel = () => (
    <div className="w-80 bg-gray-900 border-l border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">AI Assistant</h3>
      </div>
      
      <div className="flex-1 p-3 space-y-3">
        <div className="space-y-2">
          <button
            onClick={() => generateCode('Create a new component', true)}
            disabled={isGenerating}
            className="w-full p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            {isGenerating ? '🤖 Generating...' : '🤖 Generate Component'}
          </button>
          
          <button
            onClick={() => generateCode('Optimize current file', true)}
            disabled={isGenerating}
            className="w-full p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            ✨ Optimize Code
          </button>
          
          <button
            onClick={() => generateCode('Add comprehensive tests', true)}
            disabled={isGenerating}
            className="w-full p-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm rounded transition-colors"
          >
            🧪 Generate Tests
          </button>
        </div>
        
        <div className="border-t border-gray-700 pt-3">
          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Quick Actions</h4>
          <div className="space-y-1">
            <button className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              📝 Add Documentation
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              🔧 Fix Syntax Errors
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              🎨 Improve Styling
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-300 hover:bg-gray-800 rounded">
              ⚡ Performance Optimize
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Context menu component
  const ContextMenu = () => {
    if (!contextMenu) return null

    return (
      <div
        className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onMouseLeave={hideContextMenu}
      >
        {contextMenu.items.map((item, index) => (
          <div key={index}>
            {item.separator ? (
              <div className="border-t border-gray-600 my-1" />
            ) : (
              <button
                className="w-full text-left px-3 py-1 text-sm text-gray-300 hover:bg-gray-700 flex items-center"
                onClick={() => {
                  item.action()
                  hideContextMenu()
                }}
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`vscode-ide h-full flex ${className}`} onClick={hideContextMenu}>
      {/* File Explorer */}
      <div className="w-64">
        <FileExplorer />
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        <TabBar />
        <div className="flex-1" ref={monacoRef} />
      </div>

      {/* AI Assistant Panel */}
      <AIAssistantPanel />

      {/* Context Menu */}
      <ContextMenu />
    </div>
  )
}

// Utility functions
const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const languageMap: { [key: string]: string } = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'swift': 'swift',
    'm': 'objective-c',
    'h': 'objective-c',
    'scad': 'scad',
    'cs': 'csharp',
    'py': 'python',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'xml': 'xml',
    'plist': 'xml',
    'shader': 'hlsl',
    'gcode': 'gcode'
  }
  return languageMap[ext || ''] || 'plaintext'
}

const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase()
  const iconMap: { [key: string]: string } = {
    'ts': '🟦',
    'tsx': '🟦',
    'js': '🟨',
    'jsx': '🟨',
    'swift': '🟠',
    'm': '🔵',
    'h': '🔵',
    'scad': '🟫',
    'cs': '🟪',
    'py': '🐍',
    'json': '📋',
    'yaml': '📄',
    'yml': '📄',
    'md': '📝',
    'html': '🌐',
    'css': '🎨',
    'scss': '🎨',
    'xml': '📄',
    'plist': '⚙️',
    'shader': '✨',
    'gcode': '🖨️'
  }
  return iconMap[ext || ''] || '📄'
}

const getDefaultTemplate = (language: string, builderType: string): string => {
  const templates: { [key: string]: { [key: string]: string } } = {
    'ipa': {
      'swift': `import UIKit

class ViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        view.backgroundColor = .systemBackground
        // Add your UI setup here
    }
}`,
      'objective-c': `#import "ViewController.h"

@implementation ViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    [self setupUI];
}

- (void)setupUI {
    self.view.backgroundColor = [UIColor systemBackgroundColor];
    // Add your UI setup here
}

@end`
    },
    'printer': {
      'scad': `// OpenSCAD 3D Model
// Generated by Multi-Hub Printer Builder

// Parameters
width = 50;
height = 30;
depth = 20;

// Main model
difference() {
    // Outer shape
    cube([width, height, depth], center=true);
    
    // Inner cutout
    translate([0, 0, 2])
    cube([width-4, height-4, depth], center=true);
}`
    },
    'game': {
      'csharp': `using UnityEngine;

public class GameController : MonoBehaviour
{
    [Header("Game Settings")]
    public float gameSpeed = 1.0f;
    
    private void Start()
    {
        InitializeGame();
    }
    
    private void Update()
    {
        UpdateGame();
    }
    
    private void InitializeGame()
    {
        // Initialize your game here
    }
    
    private void UpdateGame()
    {
        // Update game logic here
    }
}`
    }
  }

  return templates[builderType]?.[language] || `// New ${language} file
// Generated by Multi-Hub ${builderType.toUpperCase()} Builder

// Add your code here`
}

const getBuilderContext = (builderType: string): string => {
  const contexts = {
    'ipa': 'You are an expert iOS developer creating TrollStore-compatible apps. Use Swift/Objective-C, UIKit frameworks, and follow iOS best practices.',
    'printer': 'You are an expert 3D modeling engineer creating printable models. Use OpenSCAD for parametric design and ensure printability.',
    'game': 'You are an expert Unity game developer creating iOS games. Use C# scripting, Unity components, and mobile optimization.',
    'ai': 'You are an expert AI/ML engineer creating machine learning models. Use Python, TensorFlow/PyTorch, and follow ML best practices.'
  }
  return contexts[builderType] || 'You are an expert developer.'
}

export default VSCodeIDE
