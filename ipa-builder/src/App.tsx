import React, { useState, useEffect } from 'react'

interface BuildConfig {
  appName: string
  appType: 'universal' | 'trollstore-15.5' | 'trollstore-17.0'
  features: string[]
  permissions: string[]
  description: string
}

const App: React.FC = () => {
  const [config, setConfig] = useState<BuildConfig>({
    appName: '',
    appType: 'universal',
    features: [],
    permissions: [],
    description: ''
  })
  const [building, setBuilding] = useState(false)
  const [buildResult, setBuildResult] = useState<any>(null)

  const handleBuild = async () => {
    setBuilding(true)
    try {
      const response = await fetch('/.netlify/functions/trigger-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      })
      const result = await response.json()
      setBuildResult(result)
    } catch (error) {
      console.error('Build failed:', error)
      setBuildResult({ error: 'Build failed' })
    }
    setBuilding(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-blue-400">📱 iOS App Builder</h1>
        <p className="text-gray-300 mt-2">Build Universal iOS apps and TrollStore apps with AI</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">App Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">App Name</label>
              <input
                type="text"
                value={config.appName}
                onChange={(e) => setConfig({...config, appName: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="My Awesome App"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">App Type</label>
              <select
                value={config.appType}
                onChange={(e) => setConfig({...config, appType: e.target.value as any})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="universal">Universal iOS App</option>
                <option value="trollstore-15.5">TrollStore 15.5 (Semi-Jailbreak)</option>
                <option value="trollstore-17.0">TrollStore 17.0 (Rootful)</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-24"
              placeholder="Describe what your app should do..."
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['File Manager', 'Network Access', 'Camera', 'Location', 'Notifications', 'Background Tasks', 'System Access', 'Custom UI'].map(feature => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.features.includes(feature)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({...config, features: [...config.features, feature]})
                      } else {
                        setConfig({...config, features: config.features.filter(f => f !== feature)})
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleBuild}
            disabled={building || !config.appName}
            className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded font-medium"
          >
            {building ? '🔨 Building...' : '🚀 Build App'}
          </button>
        </div>

        {buildResult && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Build Result</h3>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(buildResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default App