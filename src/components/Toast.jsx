import React, { useState, useEffect, createContext, useContext } from 'react'
import './Toast.css'

// Toast Context
const ToastContext = createContext()

// Toast Hook
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    const toast = { id, message, type, duration }
    
    setToasts(prev => [...prev, toast])
    
    // 自动移除
    setTimeout(() => {
      removeToast(id)
    }, duration)
    
    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message, duration) => addToast(message, 'success', duration)
  const error = (message, duration) => addToast(message, 'error', duration)
  const warning = (message, duration) => addToast(message, 'warning', duration)
  const info = (message, duration) => addToast(message, 'info', duration)
  const showToast = (message, type = 'info', duration = 4000) => addToast(message, type, duration)

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast, showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container" aria-live="polite" aria-label="通知消息">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // 入场动画
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleRemove = () => {
    setIsLeaving(true)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      default: return 'ℹ️'
    }
  }

  const getAriaRole = () => {
    return toast.type === 'error' ? 'alert' : 'status'
  }

  return (
    <div 
      className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''} ${isLeaving ? 'toast-leaving' : ''}`}
      role={getAriaRole()}
      aria-live="polite"
    >
      <div className="toast-content">
        <span className="toast-icon" aria-hidden="true">{getIcon()}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button 
        className="toast-close"
        onClick={handleRemove}
        aria-label="关闭通知"
        type="button"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
