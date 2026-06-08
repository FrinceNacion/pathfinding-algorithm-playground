import { useEffect, useRef, useCallback, useState } from 'react'
import PathfindingCanvas from './Canvas.jsx'
import ToolBox from './ToolBox.jsx'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {

  return (
    <div>
      <div className="d-flex justify-content-center height-100vh align-items-center">
        <PathfindingCanvas style={{width: "100%"}}/>
      </div>
    </div>
  )
}

export default App