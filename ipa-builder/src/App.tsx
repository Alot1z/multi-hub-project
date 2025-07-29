import React, { useState, useEffect } from 'react'
import { Header } from './components/layout/Header'
import { ConfigurationWizard } from './components/wizard/ConfigurationWizard'
import { BuildStatus } from './components/build/BuildStatus'
import { AppHistory } from './components/history/AppHistory'
import { BuildConfig } from './types/build'
import { triggerBuild } from './services/buildService'

const App: React.FC = () => {
  const [config, setConfig] = useState<BuildConfig>({
    appName: '',
    appType: 'universal',
    features: [],
    permissions: [],
    description: '',
    targetVersion: '15.0'
  })
  
  const [building, setBuilding] = useState(false)
  const [buildResult, setBuildResult] = useState<any>(null)
  const [buildHistory, setBuildHistory] = useState<any[]>([])

  useEffect(() => {
    // Load build history from localStorage
    const history = localStorage.getItem('ipa-build-history')
    if (history) {
      setBuildHistory(JSON.parse(history))
    }
  }, [])

  const handleBuild = async () => {
    setBuilding(true)
    setBuildResult(null)
    
    try {
      const result = await triggerBuild(config)
      setBuildResult(result)
      
      // Add to history
      const newBuild = {
        id: result.buildId || Date.now().toString(),
        config,
        result,
        timestamp: new Date().toISOString()
      }
      
      const updatedHistory = [newBuild, ...buildHistory.slice(0, 9)]
      setBuildHistory(updatedHistory)
      localStorage.setItem('ipa-build-history', JSON.stringify(updatedHistory))
      
    } catch (error) {
      console.error('Build failed:', error)
      setBuildResult({ 
        error: 'Build failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      })
    } finally {
      setBuilding(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ConfigurationWizard 
              config={config}
              setConfig={setConfig}
              onBuild={handleBuild}
              building={building}
            />
          </div>
          
          <div className="space-y-6">
            <BuildStatus 
              building={building}
              result={buildResult}
            />
            
            <AppHistory 
              history={buildHistory}
              onLoadConfig={setConfig}
            />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App