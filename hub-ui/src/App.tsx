import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom'

interface PlatformConfig {
  base_url: string
  subprojects: Record<string, string>
}

const PlatformRouter: React.FC = () => {
  const [config, setConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPlatformConfig()
  }, [])

  const loadPlatformConfig = async () => {
    try {
      // Try multiple sources for platform config
      const urls = [
        'https://alo1z.github.io/.platform.json',
        'https://raw.githubusercontent.com/Alot1z/github.io/main/.platform.json',
        '/.platform.json'
      ]

      for (const url of urls) {
        try {
          const response = await fetch(url)
          if (response.ok) {
            const data = await response.json()
            setConfig(data)
            setLoading(false)
            return
          }
        } catch (e) {
          console.warn(`Failed to load from ${url}`)
        }
      }
      
      // Fallback config
      setConfig({
        base_url: "https://alo1z.github.io",
        subprojects: {
          "ipa-builder": "PLACEHOLDER_IPA_URL",
          "printer-builder": "PLACEHOLDER_3D_URL", 
          "game-builder": "PLACEHOLDER_GAME_URL",
          "ai-models": "PLACEHOLDER_AI_URL"
        }
      })
      setLoading(false)
    } catch (error) {
      console.error('Failed to load platform config:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Multi-Hub Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage config={config} />} />
        <Route path="/:projectId" element={<ProjectFrame config={config} />} />
      </Routes>
    </Router>
  )
}

const HomePage: React.FC<{ config: PlatformConfig | null }> = ({ config }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-6">
        <h1 className="text-3xl font-bold text-blue-400">🏭 Multi-Hub AI Platform</h1>
        <p className="text-gray-300 mt-2">AI-driven DevOps for iOS, 3D Printing, Games & More</p>
      </header>
      
      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config && Object.entries(config.subprojects).map(([id, url]) => (
            <ProjectCard key={id} id={id} url={url} />
          ))}
        </div>
      </main>
    </div>
  )
}

const ProjectCard: React.FC<{ id: string; url: string }> = ({ id, url }) => {
  const getProjectInfo = (id: string) => {
    const info = {
      'ipa-builder': { name: 'iOS App Builder', icon: '📱', desc: 'Build TrollStore & Universal iOS apps' },
      'printer-builder': { name: '3D Printer Builder', icon: '🖨️', desc: 'Generate 3D models & print files' },
      'game-builder': { name: 'Game Builder', icon: '🎮', desc: 'Create iOS games & multiplayer' },
      'ai-models': { name: 'AI Models', icon: '🧠', desc: 'AI model management & routing' }
    }
    return info[id as keyof typeof info] || { name: id, icon: '⚙️', desc: 'Custom builder' }
  }

  const project = getProjectInfo(id)
  
  return (
    <a 
      href={`/${id}`}
      className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors border border-gray-700"
    >
      <div className="text-4xl mb-4">{project.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
      <p className="text-gray-400 text-sm">{project.desc}</p>
      <div className="mt-4 text-xs text-gray-500">
        Status: {url.includes('PLACEHOLDER') ? '🔄 Setting up...' : '✅ Ready'}
      </div>
    </a>
  )
}

const ProjectFrame: React.FC<{ config: PlatformConfig | null }> = ({ config }) => {
  const { projectId } = useParams<{ projectId: string }>()
  
  if (!config || !projectId || !config.subprojects[projectId]) {
    return <Navigate to="/" replace />
  }

  const projectUrl = config.subprojects[projectId]
  
  if (projectUrl.includes('PLACEHOLDER')) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">🔄 Setting up {projectId}</h2>
          <p className="text-gray-400">This project is being configured...</p>
          <a href="/" className="mt-4 inline-block bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
            ← Back to Hub
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-gray-800 p-2 flex items-center justify-between">
        <a href="/" className="text-blue-400 hover:text-blue-300">← Back to Hub</a>
        <span className="text-white font-medium">{projectId}</span>
        <div className="w-20"></div>
      </header>
      <iframe 
        src={projectUrl}
        className="flex-1 w-full border-none"
        title={projectId}
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads"
      />
    </div>
  )
}

export default PlatformRouter