import React from 'react'
import { CustomQodoGen } from './components/CustomQodoGen'

function App() {
  return (
    <div className="App">
      <CustomQodoGen 
        enable20xBetter={true}
        enableEnsembleAI={true}
        enableRealTimeGeneration={true}
      />
    </div>
  )
}

export default App