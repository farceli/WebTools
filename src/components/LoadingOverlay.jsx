import React from 'react'
import './LoadingOverlay.css'

const LoadingOverlay = ({ 
  isVisible, 
  message = '加载中...', 
  progress = null,
  backdrop = true 
}) => {
  if (!isVisible) return null

  return (
    <div className={`loading-overlay ${backdrop ? 'loading-backdrop' : ''}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <div className="loading-message">{message}</div>
        {progress !== null && (
          <div className="loading-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <div className="progress-text">{Math.round(progress)}%</div>
          </div>
        )}
      </div>
    </div>
  )
}

// 全局加载组件
export const GlobalLoading = ({ children }) => {
  const [loading, setLoading] = React.useState({
    isVisible: false,
    message: '加载中...',
    progress: null
  })

  // 提供全局loading控制方法
  React.useEffect(() => {
    window.showGlobalLoading = (message = '加载中...', progress = null) => {
      setLoading({ isVisible: true, message, progress })
    }
    
    window.hideGlobalLoading = () => {
      setLoading(prev => ({ ...prev, isVisible: false }))
    }
    
    window.updateGlobalLoading = (message, progress) => {
      setLoading(prev => ({ 
        ...prev, 
        message: message !== undefined ? message : prev.message,
        progress: progress !== undefined ? progress : prev.progress
      }))
    }

    return () => {
      delete window.showGlobalLoading
      delete window.hideGlobalLoading
      delete window.updateGlobalLoading
    }
  }, [])

  return (
    <>
      {children}
      <LoadingOverlay 
        isVisible={loading.isVisible}
        message={loading.message}
        progress={loading.progress}
      />
    </>
  )
}

export default LoadingOverlay
