import { useEffect, useCallback } from 'react'

// 快捷键配置
const SHORTCUTS = {
  // 全局快捷键
  'ctrl+k': 'search',           // 快速搜索/切换工具
  'ctrl+/': 'help',             // 显示帮助
  'esc': 'escape',              // 取消操作
  'ctrl+shift+d': 'debug',      // 调试模式
  
  // 导航快捷键
  'ctrl+1': 'nav-image',        // 图片生成
  'ctrl+2': 'nav-video',        // 视频生成
  'ctrl+3': 'nav-file',         // 文件生成
  'ctrl+4': 'nav-data',         // 数据生成
  'ctrl+5': 'nav-word',         // 文字统计
  
  // 操作快捷键
  'ctrl+enter': 'execute',      // 执行主要操作
  'ctrl+r': 'refresh',          // 刷新/重新生成
  'ctrl+c': 'copy',             // 复制结果
  'ctrl+d': 'download',         // 下载
  'ctrl+shift+c': 'clear',      // 清空
  
  // 编辑快捷键
  'ctrl+z': 'undo',             // 撤销
  'ctrl+y': 'redo',             // 重做
  'ctrl+a': 'select-all',       // 全选
  'ctrl+f': 'find',             // 查找
}

// 检查是否按下了修饰键组合
const checkModifiers = (event, shortcut) => {
  const parts = shortcut.toLowerCase().split('+')
  const key = parts[parts.length - 1]
  const modifiers = parts.slice(0, -1)
  
  // 检查主键
  if (event.key.toLowerCase() !== key && event.code.toLowerCase() !== key.toLowerCase()) {
    return false
  }
  
  // 检查修饰键
  const hasCtrl = modifiers.includes('ctrl')
  const hasShift = modifiers.includes('shift') 
  const hasAlt = modifiers.includes('alt')
  const hasMeta = modifiers.includes('meta') || modifiers.includes('cmd')
  
  return (
    event.ctrlKey === hasCtrl &&
    event.shiftKey === hasShift &&
    event.altKey === hasAlt &&
    event.metaKey === hasMeta
  )
}

// 快捷键处理Hook
export const useKeyboardShortcuts = (handlers = {}, dependencies = []) => {
  const handleKeyDown = useCallback((event) => {
    // 如果焦点在输入框内，且不是特殊快捷键，则忽略
    const activeElement = document.activeElement
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.contentEditable === 'true'
    )
    
    // 允许在输入框中使用的快捷键
    const allowedInInput = ['esc', 'ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+z', 'ctrl+y']
    
    for (const [shortcut, action] of Object.entries(SHORTCUTS)) {
      if (checkModifiers(event, shortcut)) {
        // 如果在输入框中且不是允许的快捷键，则跳过
        if (isInputFocused && !allowedInInput.includes(shortcut)) {
          continue
        }
        
        // 查找对应的处理函数
        const handler = handlers[action]
        if (handler && typeof handler === 'function') {
          event.preventDefault()
          event.stopPropagation()
          handler(event)
          return
        }
      }
    }
  }, [handlers, ...dependencies])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return { SHORTCUTS }
}

// 全局快捷键管理Hook
export const useGlobalShortcuts = () => {
  const navigate = (path) => {
    window.location.hash = path
  }

  const handlers = {
    'nav-image': () => navigate('#/image-generator'),
    'nav-video': () => navigate('#/video-generator'),
    'nav-file': () => navigate('#/file-generator'), 
    'nav-data': () => navigate('#/data-generator'),
    'nav-word': () => navigate('#/word-counter'),
    
    'help': () => {
      // 显示快捷键帮助
      if (window.showKeyboardHelp) {
        window.showKeyboardHelp()
      }
    },
    
    'escape': () => {
      // 取消当前操作
      if (window.hideGlobalLoading) {
        window.hideGlobalLoading()
      }
      // 关闭模态框等
      const modals = document.querySelectorAll('.modal, .overlay')
      modals.forEach(modal => modal.click())
    },
    
    'debug': () => {
      // 开发者调试信息
      console.log('🔍 Debug Info:', {
        url: window.location.href,
        userAgent: navigator.userAgent,
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        memory: performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
        } : 'unavailable'
      })
    }
  }

  useKeyboardShortcuts(handlers)
}

// 特定工具的快捷键Hook
export const useToolShortcuts = (toolActions = {}) => {
  const handlers = {
    'execute': toolActions.execute || (() => {}),
    'refresh': toolActions.refresh || (() => {}),
    'copy': toolActions.copy || (() => {}),
    'download': toolActions.download || (() => {}),
    'clear': toolActions.clear || (() => {}),
    'undo': toolActions.undo || (() => {}),
    'redo': toolActions.redo || (() => {}),
    'select-all': toolActions.selectAll || (() => {}),
    'find': toolActions.find || (() => {}),
  }

  useKeyboardShortcuts(handlers, [toolActions])
}

export default useKeyboardShortcuts
