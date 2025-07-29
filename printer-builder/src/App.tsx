import React, { useState } from 'react'

interface PrintConfig {
  modelName: string
  modelType: 'basic-shape' | 'electronics-case' | 'custom'
  dimensions: {
    width: number
    height: number
    depth: number
  }
  features: string[]
  description: string
}

const App: React.FC = () => {
  const [config, setConfig] = useState<PrintConfig>({
    modelName: '',
    modelType: 'basic-shape',
    dimensions: { width: 50, height: 50, depth: 20 },
    features: [],
    description: ''
  })
  const [building, setBuilding] = useState(false)
  const [buildResult, setBuildResult] = useState<any>(null)

  const handleBuild = async () => {
    setBuilding(true)
    try {
      const response = await fetch('/.netlify/functions/trigger-3d-build', {
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
        <h1 className="text-3xl font-bold text-green-400">🖨️ 3D Printer Builder</h1>
        <p className="text-gray-300 mt-2">Generate 3D models with OpenSCAD and Blender previews</p>
      </header>

      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Model Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Model Name</label>
              <input
                type="text"
                value={config.modelName}
                onChange={(e) => setConfig({...config, modelName: e.target.value})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                placeholder="Raspberry Pi Case"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Model Type</label>
              <select
                value={config.modelType}
                onChange={(e) => setConfig({...config, modelType: e.target.value as any})}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                <option value="basic-shape">Basic Shape</option>
                <option value="electronics-case">Electronics Case</option>
                <option value="custom">Custom Design</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Dimensions (mm)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Width</label>
                <input
                  type="number"
                  value={config.dimensions.width}
                  onChange={(e) => setConfig({
                    ...config, 
                    dimensions: {...config.dimensions, width: Number(e.target.value)}
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Height</label>
                <input
                  type="number"
                  value={config.dimensions.height}
                  onChange={(e) => setConfig({
                    ...config, 
                    dimensions: {...config.dimensions, height: Number(e.target.value)}
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Depth</label>
                <input
                  type="number"
                  value={config.dimensions.depth}
                  onChange={(e) => setConfig({
                    ...config, 
                    dimensions: {...config.dimensions, depth: Number(e.target.value)}
                  })}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-24"
              placeholder="Describe your 3D model requirements..."
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-3">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Mounting Holes', 'Ventilation', 'Cable Management', 'Stackable', 'Removable Top', 'LED Cutouts', 'GPIO Access', 'Custom Text'].map(feature => (
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
            disabled={building || !config.modelName}
            className="mt-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-6 py-3 rounded font-medium"
          >
            {building ? '🔨 Generating...' : '🚀 Generate 3D Model'}
          </button>
        </div>

        {buildResult && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">Generation Result</h3>
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