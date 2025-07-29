import React, { useState, useEffect } from 'react'

interface ModelInfo {
  name: string
  size: string
  status: 'available' | 'downloading' | 'error'
  description: string
  useCase: string[]
}

const App: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([
    {
      name: 'Mistral 7B',
      size: '4.1GB',
      status: 'available',
      description: 'General purpose reasoning and instruction following',
      useCase: ['Code Generation', 'Problem Solving', 'General Chat']
    },
    {
      name: 'TinyLlama',
      size: '637MB',
      status: 'available', 
      description: 'Lightweight model for quick tasks',
      useCase: ['Quick Responses', 'Simple Tasks', 'Fallback Model']
    },
    {
      name: 'Phi-2',
      size: '1.6GB',
      status: 'available',
      description: 'Microsoft model optimized for reasoning',
      useCase: ['Math', 'Logic', 'Analysis']
    },
    {
      name: 'CodeLlama',
      size: '3.8GB', 
      status: 'available',
      description: 'Specialized for programming tasks',
      useCase: ['Code Generation', 'Debugging', 'Documentation']
    }
  ])

  const [selectedModel, setSelectedModel] = useState<string>('Mistral 7B')
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePrompt = async () => {
    setLoading(true)
    try {
      const result = await fetch('/.netlify/functions/ai-inference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, prompt })
      })
      const data = await result.json()
      setResponse(data.response || 'No response received')
    } catch (error) {
      setResponse('Error: Failed to get AI response')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-orange-400">🧠 AI Models & Inference</h1>
        <p className="text-gray-300 mt-2">Manage and interact with local AI models</p>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Model Status */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Available Models</h2>
            <div className="space-y-4">
              {models.map(model => (
                <div key={model.name} className="bg-gray-700 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{model.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      model.status === 'available' ? 'bg-green-600' : 
                      model.status === 'downloading' ? 'bg-yellow-600' : 'bg-red-600'
                    }`}>
                      {model.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{model.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">Size: {model.size}</span>
                    <div className="flex gap-1">
                      {model.useCase.map(use => (
                        <span key={use} className="px-2 py-1 bg-gray-600 rounded text-xs">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Inference */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">AI Inference</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
              >
                {models.filter(m => m.status === 'available').map(model => (
                  <option key={model.name} value={model.name}>{model.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-32"
                placeholder="Enter your prompt here..."
              />
            </div>

            <button
              onClick={handlePrompt}
              disabled={loading || !prompt.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-4 py-2 rounded font-medium mb-4"
            >
              {loading ? '🤔 Thinking...' : '🚀 Generate Response'}
            </button>

            {response && (
              <div>
                <label className="block text-sm font-medium mb-2">Response</label>
                <div className="bg-gray-700 rounded p-4 max-h-64 overflow-y-auto">
                  <pre className="whitespace-pre-wrap text-sm">{response}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Model Management */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Model Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-700 rounded p-4 text-center">
              <h3 className="font-medium mb-2">Total Storage</h3>
              <p className="text-2xl font-bold text-blue-400">10.2GB</p>
              <p className="text-sm text-gray-400">4 models cached</p>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <h3 className="font-medium mb-2">Cache Status</h3>
              <p className="text-2xl font-bold text-green-400">100%</p>
              <p className="text-sm text-gray-400">All models offline</p>
            </div>
            <div className="bg-gray-700 rounded p-4 text-center">
              <h3 className="font-medium mb-2">Last Updated</h3>
              <p className="text-2xl font-bold text-yellow-400">2h ago</p>
              <p className="text-sm text-gray-400">Auto-sync enabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App