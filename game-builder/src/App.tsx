import React, { useState } from 'react'

interface GameConfig {
  gameName: string
  gameType: 'platformer' | 'puzzle' | 'arcade' | 'mmo'
  platform: 'ios' | 'web' | 'both'
  features: string[]
  description: string
  multiplayer: boolean
}

const App: React.FC = () => {
  const [config, setConfig] = useState<GameConfig>({
    gameName: '',
    gameType: 'platformer',
    platform: 'ios',
    features: [],
    description: '',
    multiplayer: false
  })
  const [building, setBuilding] = useState(false)
  const [buildResult, setBuildResult] = useState<any>(null)

  const handleBuild = async () => {
    setBuilding(true)
    try {
      const response = await fetch('/.netlify/functions/trigger-game-build', {
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
        <h1 className="text-3xl font-bold text-purple-400">🎮 Game Builder</h1>
        <p className="text-gray-300 mt-2">Create iOS games and multiplayer experiences</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Game Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Game Name</label>
              <input
                type="text"
                value={config.gameName}
                onChange={(e) => setConfig({...config, gameName: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="Super Adventure Game"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Game Type</label>
              <select
                value={config.gameType}
                onChange={(e) => setConfig({...config, gameType: e.target.value as any})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="platformer">2D Platformer</option>
                <option value="puzzle">Puzzle Game</option>
                <option value="arcade">Arcade Game</option>
                <option value="mmo">MMO/Multiplayer</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Platform</label>
            <div className="flex gap-4">
              {['ios', 'web', 'both'].map(platform => (
                <label key={platform} className="flex items-center">
                  <input
                    type="radio"
                    name="platform"
                    value={platform}
                    checked={config.platform === platform}
                    onChange={(e) => setConfig({...config, platform: e.target.value as any})}
                    className="mr-2"
                  />
                  <span className="capitalize">{platform}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.multiplayer}
                onChange={(e) => setConfig({...config, multiplayer: e.target.checked})}
                className="mr-2"
              />
              <span>Enable Multiplayer/MMO Features</span>
            </label>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Game Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-24"
              placeholder="Describe your game concept, mechanics, and features..."
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Game Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Physics Engine', 'Sound Effects', 'Music', 'Achievements', 'Leaderboards', 'In-App Purchases', 'Social Features', 'Cloud Save'].map(feature => (
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
            disabled={building || !config.gameName}
            className="mt-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 px-6 py-3 rounded font-medium"
          >
            {building ? '🔨 Creating Game...' : '🚀 Create Game'}
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