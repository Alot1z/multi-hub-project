import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IframeLoader } from './IframeLoader'
import { SecurityValidator } from './SecurityValidator'
import { LoadingSpinner } from './common/LoadingSpinner'
import { StatusIndicator } from './common/StatusIndicator'

interface PlatformProject {
  id: string
  name: string
  url: string
  description: string
  icon: string
  category: 'development' | 'ai' | '3d' | 'games' | 'tools'
  status: 'active' | 'maintenance' | 'beta' | 'deprecated'
  models?: string[]
  tools?: string[]
  features: string[]
}

interface PlatformRouterProps {
  className?: string
  onProjectChange?: (projectId: string) => void
  securityLevel?: 'strict' | 'moderate' | 'permissive'
}

const PLATFORM_PROJECTS: PlatformProject[] = [
  {
    id: 'hub-ui',
    name: 'Hub UI',
    url: 'https://alot1z-hub-ui.netlify.app',
    description: 'Main platform interface and router',
    icon: '🏠',
    category: 'tools',
    status: 'active',
    features: ['Navigation', 'Security', 'Iframe Management']
  },
  {
    id: 'ipa-builder',
    name: 'IPA Builder',
    url: 'https://alot1z-ipa-builder.netlify.app',
    description: 'iOS IPA builder with TrollStore support',
    icon: '📱',
    category: 'development',
    status: 'active',
    models: ['mistral-7b', 'codellama'],
    tools: ['theos', 'ldid', 'dpkg'],
    features: ['iOS App Building', 'TrollStore Integration', 'Code Signing', 'TestFlight Deploy']
  },
  {
    id: 'printer-builder',
    name: '3D Printer Builder',
    url: 'https://alot1z-printer-builder.netlify.app',
    description: '3D printer model generator',
    icon: '🖨️',
    category: '3d',
    status: 'active',
    models: ['phi-2', 'tinyllama'],
    tools: ['openscad', 'blender'],
    features: ['3D Model Generation', 'STL Export', 'Parametric Design', 'Material Calculator']
  },
  {
    id: 'game-builder',
    name: 'Game Builder',
    url: 'https://alot1z-game-builder.netlify.app',
    description: 'Game development platform',
    icon: '🎮',
    category: 'games',
    status: 'active',
    models: ['mistral-7b', 'codellama'],
    tools: ['theos', 'unity-cli'],
    features: ['Unity Integration', 'Asset Management', 'Multiplayer Setup', 'App Store Publishing']
  },
  {
    id: 'ai-models',
    name: 'AI Models',
    url: 'https://alot1z-ai-models.netlify.app',
    description: 'AI model router and prompt engine',
    icon: '🤖',
    category: 'ai',
    status: 'active',
    models: ['all'],
    features: ['Model Management', 'Local Inference', 'Prompt Processing', 'Performance Monitoring']
  }
]

export const PlatformRouter: React.FC<PlatformRouterProps> = ({
  className = '',
  onProjectChange,
  securityLevel = 'strict'
}) => {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  
  const [currentProject, setCurrentProject] = useState<PlatformProject | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [securityValidator, setSecurityValidator] = useState<SecurityValidator | null>(null)
  const [projectHistory, setProjectHistory] = useState<string[]>([])

  // Initialize security validator
  useEffect(() => {
    const validator = new SecurityValidator({
      allowedOrigins: PLATFORM_PROJECTS.map(p => p.url),
      securityLevel,
      projectId: projectId || 'unknown'
    })
    setSecurityValidator(validator)
  }, [securityLevel, projectId])

  // Handle project selection
  const selectProject = useCallback((project: PlatformProject) => {
    if (currentProject?.id === project.id) return

    setIsLoading(true)
    setError('')
    
    // Add to history
    setProjectHistory(prev => {
      const newHistory = prev.filter(id => id !== project.id)
      return [project.id, ...newHistory].slice(0, 10) // Keep last 10
    })

    setCurrentProject(project)
    navigate(`/${project.id}`)
    onProjectChange?.(project.id)
  }, [currentProject, navigate, onProjectChange])

  // Handle project loading
  const handleProjectLoad = useCallback(() => {
    setIsLoading(false)
  }, [])

  // Handle project error
  const handleProjectError = useCallback((error: Error) => {
    setIsLoading(false)
    setError(error.message)
  }, [])

  // Initialize current project from URL
  useEffect(() => {
    if (projectId) {
      const project = PLATFORM_PROJECTS.find(p => p.id === projectId)
      if (project) {
        setCurrentProject(project)
      } else {
        setError(`Project "${projectId}" not found`)
        navigate('/')
      }
    } else {
      setCurrentProject(null)
    }
  }, [projectId, navigate])

  // Render project grid (home view)
  const renderProjectGrid = () => (
    <div className="platform-router-grid">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Multi-Hub Platform</h1>
        <p className="text-gray-300 text-lg">Choose a builder to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {PLATFORM_PROJECTS.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onSelect={() => selectProject(project)}
            isRecent={projectHistory.includes(project.id)}
          />
        ))}
      </div>

      {/* Recent projects */}
      {projectHistory.length > 0 && (
        <div className="recent-projects">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Projects</h2>
          <div className="flex flex-wrap gap-3">
            {projectHistory.slice(0, 5).map(projectId => {
              const project = PLATFORM_PROJECTS.find(p => p.id === projectId)
              if (!project) return null
              
              return (
                <button
                  key={projectId}
                  onClick={() => selectProject(project)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-lg">{project.icon}</span>
                  <span className="text-white">{project.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  // Render project iframe
  const renderProjectIframe = () => {
    if (!currentProject || !securityValidator) return null

    return (
      <div className="platform-router-iframe h-full">
        {/* Project header */}
        <div className="project-header flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <span>←</span>
              <span>Back to Hub</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{currentProject.icon}</span>
              <div>
                <h2 className="text-lg font-semibold text-white">{currentProject.name}</h2>
                <p className="text-sm text-gray-400">{currentProject.description}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <StatusIndicator 
              status={currentProject.status === 'active' ? 'success' : 'warning'}
              message={`Status: ${currentProject.status}`}
              size="sm"
            />
            
            {securityValidator && (
              <div className="text-sm text-gray-400">
                Security: {securityLevel}
              </div>
            )}
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="error-banner bg-red-900/20 border border-red-500 p-4 m-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-red-400 text-lg">⚠️</span>
              <span className="text-red-400 font-semibold">Error loading project</span>
            </div>
            <p className="text-gray-300 mt-2">{error}</p>
            <button
              onClick={() => {
                setError('')
                selectProject(currentProject)
              }}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Iframe container */}
        <div className="iframe-container flex-1" style={{ height: 'calc(100vh - 120px)' }}>
          <IframeLoader
            src={currentProject.url}
            title={currentProject.name}
            projectId={currentProject.id}
            onLoad={handleProjectLoad}
            onError={handleProjectError}
            securityLevel={securityLevel}
            allowedOrigins={PLATFORM_PROJECTS.map(p => p.url)}
            className="w-full h-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className={`platform-router ${className}`}>
      {isLoading && (
        <div className="loading-overlay fixed inset-0 bg-gray-900/80 flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-white">Loading {currentProject?.name}...</p>
          </div>
        </div>
      )}

      {currentProject ? renderProjectIframe() : renderProjectGrid()}
    </div>
  )
}

// Project card component
interface ProjectCardProps {
  project: PlatformProject
  onSelect: () => void
  isRecent?: boolean
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, isRecent = false }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'beta': return 'text-yellow-400'
      case 'maintenance': return 'text-orange-400'
      case 'deprecated': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'development': return 'bg-blue-500/20 text-blue-400'
      case 'ai': return 'bg-purple-500/20 text-purple-400'
      case '3d': return 'bg-green-500/20 text-green-400'
      case 'games': return 'bg-red-500/20 text-red-400'
      case 'tools': return 'bg-gray-500/20 text-gray-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div 
      onClick={onSelect}
      className={`project-card relative p-6 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg cursor-pointer transition-all duration-200 transform hover:scale-105 ${
        isRecent ? 'ring-2 ring-blue-500/50' : ''
      }`}
    >
      {/* Recent indicator */}
      {isRecent && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
          Recent
        </div>
      )}

      {/* Project icon and name */}
      <div className="flex items-center space-x-3 mb-4">
        <span className="text-3xl">{project.icon}</span>
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(project.category)}`}>
            {project.category}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4">{project.description}</p>

      {/* Features */}
      <div className="features mb-4">
        <div className="flex flex-wrap gap-1">
          {project.features.slice(0, 3).map(feature => (
            <span 
              key={feature}
              className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
            >
              {feature}
            </span>
          ))}
          {project.features.length > 3 && (
            <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
              +{project.features.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Status and models */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status).replace('text-', 'bg-')}`} />
          <span className={`text-xs ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        {project.models && (
          <div className="text-xs text-gray-400">
            {project.models.length} model{project.models.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  )
}

export default PlatformRouter