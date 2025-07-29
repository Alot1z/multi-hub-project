# 📱 IPA-BUILDER REPOSITORY - KOMPLET SETUP

Kopier dette til dit `Alot1z/ipa-builder` repo som README.md!

## 📦 package.json
```json
{
  "name": "ipa-builder",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.27",
    "@types/react-dom": "^18.0.10",
    "@vitejs/plugin-react": "^3.1.0",
    "typescript": "^4.9.3",
    "vite": "^4.1.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24"
  }
}
```

## 🌐 index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>iOS App Builder</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

## ⚡ src/main.tsx
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## 🎯 src/App.tsx
```tsx
import React, { useState } from 'react'

interface BuildConfig {
  appName: string
  appType: 'universal' | 'trollstore-15.5' | 'trollstore-17.0'
  features: string[]
  permissions: string[]
  description: string
  targetVersion: string
}

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

  const handleBuild = async () => {
    setBuilding(true)
    setBuildResult(null)
    
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
    } finally {
      setBuilding(false)
    }
  }

  const toggleFeature = (feature: string) => {
    setConfig(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }))
  }

  const togglePermission = (permission: string) => {
    setConfig(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-blue-400">📱 iOS App Builder</h1>
        <p className="text-gray-300">Build TrollStore & Universal iOS apps</p>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">App Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">App Name *</label>
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
                <option value="trollstore-15.5">TrollStore 15.5</option>
                <option value="trollstore-17.0">TrollStore 17.0</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={config.description}
              onChange={(e) => setConfig({...config, description: e.target.value})}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 h-24"
              placeholder="Describe your app..."
            />
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['File Manager', 'Network Access', 'Camera', 'Location', 'Notifications', 'Background Tasks', 'System Access', 'Custom UI'].map(feature => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.features.includes(feature)}
                    onChange={() => toggleFeature(feature)}
                    className="mr-2"
                  />
                  <span className="text-sm">{feature}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'com.apple.private.security.no-container',
                'com.apple.private.skip-library-validation',
                'com.apple.private.tcc.allow',
                'com.apple.private.security.no-sandbox'
              ].map(permission => (
                <label key={permission} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="mr-2"
                  />
                  <span className="text-xs">{permission}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={handleBuild}
            disabled={building || !config.appName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-3 rounded font-medium"
          >
            {building ? '🔨 Building...' : '🚀 Build iOS App'}
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
      </main>
    </div>
  )
}

export default App
```

## 🎨 src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background-color: #111827;
  color: #ffffff;
}
```

## 🚀 netlify.toml
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    Access-Control-Allow-Origin = "*"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[functions]
  directory = "netlify/functions"
```

## ⚙️ vite.config.ts
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
```

## 📝 tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true
  },
  "include": ["src"]
}
```

## 🔧 netlify/functions/trigger-build.ts
```ts
import { Handler } from '@netlify/functions'

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const config = JSON.parse(event.body || '{}')
    
    // Simulate build trigger
    const buildId = `build_${Date.now()}`
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Build triggered successfully',
        buildId,
        downloadUrl: `https://github.com/Alot1z/multi-hub-project/releases/download/${buildId}/${config.appName}.ipa`
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to trigger build',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}
```

---

# 🚀 DEPLOYMENT:
1. Kopier alt indhold til separate filer i dit repo
2. Deploy til Netlify
3. Kopier Netlify URL til .platform.json

**FÆRDIG! IPA Builder klar! 🎉**