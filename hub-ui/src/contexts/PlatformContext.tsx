import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PlatformConfig } from '../types/platform'
import { loadPlatformConfig } from '../services/platformService'

interface PlatformContextType {
  config: PlatformConfig | null
  loading: boolean
  error: string | null
  reloadConfig: () => Promise<void>
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined)

export const usePlatform = () => {
  const context = useContext(PlatformContext)
  if (context === undefined) {
    throw new Error('usePlatform must be used within a PlatformProvider')
  }
  return context
}

interface PlatformProviderProps {
  children: ReactNode
}

export const PlatformProvider: React.FC<PlatformProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reloadConfig = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const platformConfig = await loadPlatformConfig()
      setConfig(platformConfig)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load platform configuration')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reloadConfig()
  }, [])

  return (
    <PlatformContext.Provider value={{ config, loading, error, reloadConfig }}>
      {children}
    </PlatformContext.Provider>
  )
}