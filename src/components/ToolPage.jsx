import React from 'react'
import './ToolPage.css'
import './NumberInput.css'

function ToolPage({ title, description, icon, children }) {
  return (
    <div className="tool-page">
      <header className="tool-header">
        <div className="tool-icon" aria-hidden="true">{icon}</div>
        <div className="tool-info">
          <h1 className="tool-title" id="page-title">{title}</h1>
          <p className="tool-description" id="page-description">{description}</p>
        </div>
      </header>
      
      <main 
        className="tool-body" 
        role="main" 
        aria-labelledby="page-title" 
        aria-describedby="page-description"
      >
        {children}
      </main>
    </div>
  )
}

export default ToolPage
