import React from 'react'
import { usePlatform } from '../contexts/PlatformContext'
import { ProjectCard } from '../components/projects/ProjectCard'
import { LoadingSpinner } from '../components/common/LoadingSpinner'

export const HomePage: React.FC = () => {
  const { config, loading, error } = usePlatform()

  if (loading) {
    return <LoadingSpinner message="Loading Multi-Hub Platform..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-400">
          <h2 className="text-xl font-bold mb-2">Configuration Error</h2>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!config) {
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-blue-400 mb-4">
          🏭 Multi-Hub AI Platform
        </h1>
        <p className="text-xl text-gray-300">
          AI-driven DevOps for iOS, 3D Printing, Games & More
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(config.subprojects).map(([id, project]) => (
          <ProjectCard key={id} id={id} project={project} />
        ))}
      </div>
    </div>
  )
}