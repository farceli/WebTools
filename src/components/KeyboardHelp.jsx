import React, { useState, useEffect } from 'react'
import './KeyboardHelp.css'

const SHORTCUTS_INFO = [
  {
    category: '导航',
    shortcuts: [
      { key: 'Ctrl + 1', desc: '图片生成' },
      { key: 'Ctrl + 2', desc: '视频生成' },
      { key: 'Ctrl + 3', desc: '文件生成' },
      { key: 'Ctrl + 4', desc: '数据生成' },
      { key: 'Ctrl + 5', desc: '文字统计' },
    ]
  },
  {
    category: '操作',
    shortcuts: [
      { key: 'Ctrl + Enter', desc: '执行主要操作' },
      { key: 'Ctrl + R', desc: '刷新/重新生成' },
      { key: 'Ctrl + C', desc: '复制结果' },
      { key: 'Ctrl + D', desc: '下载文件' },
      { key: 'Ctrl + Shift + C', desc: '清空内容' },
    ]
  },
  {
    category: '编辑',
    shortcuts: [
      { key: 'Ctrl + Z', desc: '撤销' },
      { key: 'Ctrl + Y', desc: '重做' },
      { key: 'Ctrl + A', desc: '全选' },
      { key: 'Ctrl + F', desc: '查找' },
    ]
  },
  {
    category: '其他',
    shortcuts: [
      { key: 'Ctrl + K', desc: '快速搜索' },
      { key: 'Ctrl + /', desc: '显示快捷键帮助' },
      { key: 'Esc', desc: '取消/关闭' },
      { key: 'Ctrl + Shift + D', desc: '调试信息' },
    ]
  }
]

const KeyboardHelp = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    window.showKeyboardHelp = () => setIsVisible(true)
    window.hideKeyboardHelp = () => setIsVisible(false)
    
    return () => {
      delete window.showKeyboardHelp
      delete window.hideKeyboardHelp
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setIsVisible(!isVisible)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="keyboard-help-overlay" onClick={() => setIsVisible(false)}>
      <div className="keyboard-help-modal" onClick={e => e.stopPropagation()}>
        <div className="keyboard-help-header">
          <h2>快捷键指南</h2>
          <button 
            className="keyboard-help-close"
            onClick={() => setIsVisible(false)}
            aria-label="关闭快捷键帮助"
          >
            ✕
          </button>
        </div>
        
        <div className="keyboard-help-content">
          {SHORTCUTS_INFO.map((category, index) => (
            <div key={index} className="shortcut-category">
              <h3 className="category-title">{category.category}</h3>
              <div className="shortcuts-list">
                {category.shortcuts.map((shortcut, shortcutIndex) => (
                  <div key={shortcutIndex} className="shortcut-item">
                    <div className="shortcut-keys">
                      {shortcut.key.split(' + ').map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && <span className="key-separator">+</span>}
                          <kbd className="key">{key}</kbd>
                        </React.Fragment>
                      ))}
                    </div>
                    <span className="shortcut-desc">{shortcut.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="keyboard-help-footer">
          <p>按 <kbd>Esc</kbd> 或点击背景关闭此帮助</p>
        </div>
      </div>
    </div>
  )
}

export default KeyboardHelp
