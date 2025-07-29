# 🏠 HUB-UI REPOSITORY - KOMPLET SETUP

Kopier dette til dit `Alot1z/hub-ui` repo som README.md, så har du alt!

## 📦 package.json
```json
{
  "name": "hub-ui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0"
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
  <title>Multi-Hub Platform</title>
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
import React, { useState, useEffect } from 'react'

interface PlatformConfig {
  version: string
  base_url: string
  subprojects: Record<string, {
    url: string
    description: string
  }>
}

const App: React.FC = () => {
  const [config, setConfig] = useState<PlatformConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('https://alo1z.github.io/.platform.json')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Failed to load config:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading Multi-Hub Platform...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <h1 className="text-2xl font-bold text-blue-400">🏭 Multi-Hub Platform</h1>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">AI-Driven DevOps Platform</h2>
          <p className="text-xl text-gray-300">iOS, 3D Printing, Games & More</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {config && Object.entries(config.subprojects).map(([id, project]) => (
            <a
              key={id}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-all duration-200 border-2 border-blue-500 hover:border-blue-400 hover:scale-105"
            >
              <div className="text-4xl mb-4">
                {id === 'ipa-builder' && '📱'}
                {id === 'printer-builder' && '🖨️'}
                {id === 'game-builder' && '🎮'}
                {id === 'ai-models' && '🧠'}
              </div>
              <h3 className="text-xl font-semibold mb-2 capitalize">{id.replace('-', ' ')}</h3>
              <p className="text-gray-400 text-sm">{project.description}</p>
            </a>
          ))}
        </div>
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

#root {
  min-height: 100vh;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://alo1z.github.io https://raw.githubusercontent.com; frame-src 'self' https://*.netlify.app https://*.windsurf.build;"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
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
  server: {
    port: 3000,
    host: true,
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
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 🔧 tsconfig.node.json
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

## 🎨 tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

---

# 🚀 DEPLOYMENT INSTRUKTIONER:

1. **Opret alle filer** ved at kopiere indholdet ovenfor
2. **Deploy til Netlify** - vælg dit GitHub repo
3. **Kopier Netlify URL** (fx `https://amazing-unicorn-123.netlify.app`)
4. **Opdater .platform.json** i din github.io repo med den rigtige URL

**FÆRDIG! Hub-UI er klar til brug! 🎉**