import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { PlatformProvider } from './contexts/PlatformContext'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { HomePage } from './pages/HomePage'
import { ProjectFrame } from './pages/ProjectFrame'
import { ErrorBoundary } from './components/common/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <PlatformProvider>
        <Router>
          <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/:projectId" element={<ProjectFrame />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </PlatformProvider>
    </ErrorBoundary>
  )
}

export default App