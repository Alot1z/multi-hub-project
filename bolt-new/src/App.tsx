import React from 'react'
import { BoltNewClone } from './components/BoltNewClone'

function App() {
  return (
    <div className="App">
      <BoltNewClone 
        enableAllAIModels={true}
        enableRealTimePreview={true}
        enableFileSystem={true}
        enableTerminal={true}
      />
    </div>
  )
}

export default App