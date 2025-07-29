import React from 'react'
import { Link } from 'react-router-dom'
import { SubProject } from '../../types/platform'

interface ProjectCardProps {
  id: string
  project: SubProject
}

const getProjectInfo = (id: string) => {
  const info = {
    'ipa-builder': { 
      name: 'iOS App Builder', 
      icon: '📱', 
      desc: 'Build TrollStore & Universal iOS apps',
      color: 'blue'
    },
    'printer-builder': { 
      name: '3D Printer Builder', 
      icon: '🖨️', 
      desc: 'Generate 3D models & print files',
      color: 'green'
    },
    'game-builder': { 
      name: 'Game Builder', 
      icon: '🎮', 
      desc: 'Create iOS games & multiplayer',
      color: 'purple'
    },
    'ai-models': { 
      name: 'AI Models', 
      icon: '🧠', 
      desc: 'AI model management & routing',
      color: 'orange'
    }
  }
  return info[id as keyof typeof info] || { 
    name: id, 
    icon: '⚙️', 
    desc: 'Custom builder',
    color: 'gray'
  }
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ id, project }) => {
  const projectInfo = getProjectInfo(id)
  const isReady = !project.url.includes('PLACEHOLDER')
  
  const colorClasses = {
    blue: 'border-blue-500 hover:border-blue-400',
    green: 'border-green-500 hover:border-green-400',
    purple: 'border-purple-500 hover:border-purple-400',
    orange: 'border-orange-500 hover:border-orange-400',
    gray: 'border-gray-500 hover:border-gray-400'
  }

  return (
    <Link 
      to={`/${id}`}
      className={`block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-200 border-2 ${colorClasses[projectInfo.color as keyof typeof colorClasses]} hover:scale-105`}
    >
      <div className="text-4xl mb-4">{projectInfo.icon}</div>
      <h3 className="text-xl font-semibold mb-2">{projectInfo.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{projectInfo.desc}</p>
      
      {project.models && project.models.length > 0 && (
        <div className="mb-3">
          <span className="text-xs text-gray-500">Models: </span>
          <span className="text-xs text-blue-400">{project.models.join(', ')}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="text-xs">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            isReady 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isReady ? '✅ Ready' : '🔄 Setting up...'}
          </span>
        </div>
        
        {project.status && (
          <span className={`text-xs px-2 py-1 rounded ${
            project.status === 'active' ? 'bg-green-600' :
            project.status === 'maintenance' ? 'bg-yellow-600' : 'bg-red-600'
          }`}>
            {project.status}
          </span>
        )}
      </div>
    </Link>
  )
}