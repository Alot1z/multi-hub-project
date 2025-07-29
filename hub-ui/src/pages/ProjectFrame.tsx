import React from 'react'
import { useParams, Navigate, Link } from 'react-router-dom'
import { usePlatform } from '../contexts/PlatformContext'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export const ProjectFrame: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { config, loading } = usePlatform()

  if (loading) {
    return <LoadingSpinner message={`Loading ${projectId}...`} />
  }

  if (!config || !projectId || !config.subprojects[projectId]) {
    return <Navigate to="/" replace />
  }

  const project = config.subprojects[projectId]
  
  if (project.url.includes('PLACEHOLDER')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">🔄 Setting up {projectId}</h2>
          <p className="text-gray-400 mb-6">This project is being configured...</p>
          <Link 
            to="/" 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded inline-block"
          >
            ← Back to Hub
          </Link>
        </div>
      </div>
    )
  }

  const projectUrl = new URL(project.url)
  projectUrl.searchParams.set('platform', 'multi-hub')
  projectUrl.searchParams.set('version', config.version)
  projectUrl.searchParams.set('session', Date.now().toString())

  return (
    <div className="h-screen flex flex-col">
      <div className="bg-gray-800 p-2 flex items-center justify-between border-b border-gray-700">
        <Link 
          to="/" 
          className="text-blue-400 hover:text-blue-300 flex items-center"
        >
          ← Back to Hub
        </Link>
        <span className="text-white font-medium">{project.description}</span>
        <div className="w-20"></div>
      </div>
      
      <iframe 
        src={projectUrl.toString()}
        className="flex-1 w-full border-none"
        title={project.description}
        sandbox="allow-same-origin allow-scripts allow-forms allow-downloads allow-popups"
      />
    </div>
  )
}