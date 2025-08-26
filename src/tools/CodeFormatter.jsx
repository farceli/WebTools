import React, { useState, useRef, useCallback, useEffect } from 'react'
import ToolPage from '../components/ToolPage'
import { useToast } from '../components/Toast'
import { useToolShortcuts } from '../hooks/useKeyboardShortcuts'
import './CodeFormatter.css'

// 支持的语言配置
const SUPPORTED_LANGUAGES = [
  { id: 'json', name: 'JSON', icon: '📄' },
  { id: 'sql', name: 'SQL', icon: '🗃️' },
  { id: 'css', name: 'CSS', icon: '🎨' },
  { id: 'html', name: 'HTML', icon: '🌐' },
  { id: 'javascript', name: 'JavaScript', icon: '⚡' },
  { id: 'xml', name: 'XML', icon: '📋' }
]

function CodeFormatter() {
  const [selectedLanguage, setSelectedLanguage] = useState('json')
  const [inputCode, setInputCode] = useState('')
  const [outputCode, setOutputCode] = useState('')
  const [isFormatting, setIsFormatting] = useState(false)
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  const inputRef = useRef(null)
  const outputRef = useRef(null)
  const toast = useToast()

  // 保存历史记录
  const saveToHistory = useCallback((input, output, language) => {
    const newEntry = { input, output, language, timestamp: Date.now() }
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1)
      newHistory.push(newEntry)
      return newHistory.slice(-10) // 只保留最近10条记录
    })
    setHistoryIndex(prev => Math.min(prev + 1, 9))
  }, [historyIndex])

  // 撤销/重做功能
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevEntry = history[historyIndex - 1]
      setInputCode(prevEntry.input)
      setOutputCode(prevEntry.output)
      setSelectedLanguage(prevEntry.language)
      setHistoryIndex(historyIndex - 1)
      toast.info('已撤销上一步操作')
    }
  }, [history, historyIndex, toast])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextEntry = history[historyIndex + 1]
      setInputCode(nextEntry.input)
      setOutputCode(nextEntry.output)
      setSelectedLanguage(nextEntry.language)
      setHistoryIndex(historyIndex + 1)
      toast.info('已重做操作')
    }
  }, [history, historyIndex, toast])

  // JSON 格式化器
  const formatJSON = (code, compress = false) => {
    try {
      const parsed = JSON.parse(code)
      return compress ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2)
    } catch (err) {
      throw new Error(`JSON 语法错误: ${err.message}`)
    }
  }

  // SQL 格式化器
  const formatSQL = (code, compress = false) => {
    if (compress) {
      return code.replace(/\s+/g, ' ').trim()
    }

    let formatted = code.trim()

    // 基础格式化：在主要关键字前添加换行
    const mainKeywords = ['SELECT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'HAVING']
    mainKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi')
      formatted = formatted.replace(regex, `\n${keyword}`)
    })

    // 处理 JOIN
    formatted = formatted.replace(/\b(INNER\s+JOIN|LEFT\s+JOIN|RIGHT\s+JOIN|JOIN)\b/gi, '\n$1')

    // 清理多余空行并添加缩进
    return formatted
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map((line, index) => index === 0 ? line : '  ' + line)
      .join('\n')
  }

  // CSS 格式化器
  const formatCSS = (code, compress = false) => {
    if (compress) {
      return code
        .replace(/\s+/g, ' ')
        .replace(/;\s*}/g, '}')
        .replace(/\s*{\s*/g, '{')
        .replace(/;\s*/g, ';')
        .trim()
    }

    let formatted = code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')

    // 添加缩进
    return formatted
      .split('\n')
      .map(line => {
        const trimmed = line.trim()
        if (!trimmed) return ''
        if (trimmed.endsWith('{') || trimmed.endsWith('}')) {
          return trimmed
        }
        return '  ' + trimmed
      })
      .join('\n')
      .replace(/\n+/g, '\n')
      .trim()
  }

  // HTML 格式化器
  const formatHTML = (code, compress = false) => {
    if (compress) {
      return code.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim()
    }

    let formatted = code.replace(/></g, '>\n<')
    let level = 0

    return formatted
      .split('\n')
      .map(line => {
        const trimmed = line.trim()
        if (!trimmed) return ''

        // 减少缩进级别（闭合标签）
        if (trimmed.startsWith('</')) {
          level = Math.max(0, level - 1)
        }

        const indentedLine = '  '.repeat(level) + trimmed

        // 增加缩进级别（开放标签，非自闭合）
        if (trimmed.startsWith('<') && !trimmed.startsWith('</') && !trimmed.endsWith('/>')) {
          level++
        }

        return indentedLine
      })
      .join('\n')
  }

  // JavaScript 格式化器（简化版）
  const formatJavaScript = (code, compress = false) => {
    if (compress) {
      return code.replace(/\s+/g, ' ').replace(/;\s*}/g, '}').trim()
    }

    let formatted = code
      .replace(/\s*{\s*/g, ' {\n')
      .replace(/;\s*/g, ';\n')
      .replace(/\s*}\s*/g, '\n}\n')

    let level = 0
    return formatted
      .split('\n')
      .map(line => {
        const trimmed = line.trim()
        if (!trimmed) return ''

        if (trimmed === '}') {
          level = Math.max(0, level - 1)
        }

        const indentedLine = '  '.repeat(level) + trimmed

        if (trimmed.endsWith('{')) {
          level++
        }

        return indentedLine
      })
      .join('\n')
      .replace(/\n+/g, '\n')
      .trim()
  }

  // XML 格式化器
  const formatXML = (code, compress = false) => {
    return formatHTML(code, compress) // XML 和 HTML 格式化逻辑相似
  }

  // 主格式化函数
  const formatCode = (code, language, compress = false) => {
    const formatters = {
      json: formatJSON,
      sql: formatSQL,
      css: formatCSS,
      html: formatHTML,
      javascript: formatJavaScript,
      xml: formatXML
    }

    const formatter = formatters[language]
    if (!formatter) {
      throw new Error(`不支持的语言: ${language}`)
    }

    return formatter(code, compress)
  }

  // 处理格式化
  const handleFormat = async (compress = false) => {
    if (!inputCode.trim()) {
      toast.warning('请输入要格式化的代码')
      return
    }

    setIsFormatting(true)

    try {
      // 显示全局加载状态
      if (window.showGlobalLoading) {
        window.showGlobalLoading(compress ? '正在压缩代码...' : '正在格式化代码...')
      }
      
      await new Promise(resolve => setTimeout(resolve, 200)) // 让用户看到加载状态
      const formatted = formatCode(inputCode, selectedLanguage, compress)
      setOutputCode(formatted)
      
      // 保存到历史记录
      saveToHistory(inputCode, formatted, selectedLanguage)
      
      toast.success(compress ? '代码已压缩完成' : '代码已格式化完成')
    } catch (err) {
      toast.error(`格式化失败: ${err.message}`)
      console.error('Format error:', err)
    } finally {
      setIsFormatting(false)
      if (window.hideGlobalLoading) {
        window.hideGlobalLoading()
      }
    }
  }

  // 复制到剪贴板
  const copyToClipboard = async (text, type = 'output') => {
    if (!text.trim()) {
      toast.warning('没有内容可复制')
      return
    }
    
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type === 'output' ? '格式化结果' : '原始代码'}已复制到剪贴板`)
    } catch (err) {
      toast.error('复制失败，请手动复制')
      console.error('Copy error:', err)
    }
  }

  // 清空输入
  const clearInput = useCallback(() => {
    setInputCode('')
    setOutputCode('')
    toast.info('已清空所有内容')
  }, [toast])

  // 全选功能
  const selectAll = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.select()
      toast.info('已全选输入内容')
    }
  }, [toast])

  // 查找功能（简单实现）
  const findInCode = useCallback(() => {
    if (inputRef.current) {
      const searchTerm = prompt('请输入要查找的内容:')
      if (searchTerm && inputCode.includes(searchTerm)) {
        const index = inputCode.indexOf(searchTerm)
        inputRef.current.focus()
        inputRef.current.setSelectionRange(index, index + searchTerm.length)
        toast.success(`找到匹配内容`)
      } else if (searchTerm) {
        toast.warning('未找到匹配内容')
      }
    }
  }, [inputCode, toast])


  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguage)

  // 配置快捷键
  const toolActions = {
    execute: () => handleFormat(false),
    copy: () => copyToClipboard(outputCode),
    clear: clearInput,
    undo: undo,
    redo: redo,
    selectAll: selectAll,
    find: findInCode,
    refresh: () => handleFormat(false)
  }

  useToolShortcuts(toolActions)

  // 添加防抖的自动保存功能
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputCode.trim()) {
        localStorage.setItem('codeFormatter_draft', JSON.stringify({
          code: inputCode,
          language: selectedLanguage,
          timestamp: Date.now()
        }))
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [inputCode, selectedLanguage])

  // 加载草稿
  useEffect(() => {
    const draft = localStorage.getItem('codeFormatter_draft')
    if (draft) {
      try {
        const parsed = JSON.parse(draft)
        // 只加载24小时内的草稿
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setInputCode(parsed.code)
          setSelectedLanguage(parsed.language)
          toast.info('已自动恢复上次编辑的内容')
        }
      } catch (err) {
        console.error('Failed to load draft:', err)
      }
    }
  }, [])

  return (
    <ToolPage
      title="代码格式化器"
      description="支持 JSON、SQL、CSS、HTML、JavaScript、XML 等多种语言的格式化和压缩"
      icon="⚡"
    >
      <div className="tool-content">
        {/* 简洁控制面板 */}
        <div className="simple-controls">
          <div className="language-select">
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value)
                setError('')
                setSuccess('')
              }}
              disabled={isFormatting}
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>
                  {lang.icon} {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="action-buttons">
            <button 
              className="primary-btn"
              onClick={() => handleFormat(false)}
              disabled={isFormatting || !inputCode.trim()}
            >
              {isFormatting ? '处理中...' : '格式化'}
            </button>
            
            <button 
              className="secondary-btn"
              onClick={() => handleFormat(true)}
              disabled={isFormatting || !inputCode.trim()}
            >
              压缩
            </button>
            
            <button 
              className="secondary-btn"
              onClick={clearInput}
              disabled={isFormatting}
              title="清空所有内容 (Ctrl+Shift+C)"
            >
              清空
            </button>
            
            <button 
              className="secondary-btn"
              onClick={findInCode}
              disabled={!inputCode.trim() || isFormatting}
              title="查找内容 (Ctrl+F)"
            >
              查找
            </button>
          </div>
        </div>

        {/* 历史记录指示器 */}
        {history.length > 0 && (
          <div className="history-indicator">
            <span className="history-info">
              历史记录: {historyIndex + 1}/{history.length}
            </span>
            <div className="history-actions">
              <button 
                className="history-btn"
                onClick={undo}
                disabled={historyIndex <= 0}
                title="撤销 (Ctrl+Z)"
              >
                ↶ 撤销
              </button>
              <button 
                className="history-btn"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                title="重做 (Ctrl+Y)"
              >
                ↷ 重做
              </button>
            </div>
          </div>
        )}

        {/* 编辑器区域 */}
        <div className="simple-editor-container">
          {/* 输入区域 */}
          <div className="editor-panel">
            <div className="editor-header">
              <span>输入代码</span>
              <div className="editor-header-actions">
                <button 
                  className="copy-btn"
                  onClick={() => copyToClipboard(inputCode, 'input')}
                  disabled={!inputCode.trim()}
                  title="复制输入内容"
                >
                  复制
                </button>
                <button 
                  className="copy-btn"
                  onClick={selectAll}
                  disabled={!inputCode.trim()}
                  title="全选 (Ctrl+A)"
                >
                  全选
                </button>
              </div>
            </div>
            
            <textarea
              ref={inputRef}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={`输入 ${currentLanguage?.name} 代码... (支持快捷键: Ctrl+Enter 格式化)`}
              className="code-editor"
              spellCheck={false}
              disabled={isFormatting}
              onKeyDown={(e) => {
                // 支持Tab缩进
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const start = e.target.selectionStart
                  const end = e.target.selectionEnd
                  const value = e.target.value
                  e.target.value = value.substring(0, start) + '  ' + value.substring(end)
                  e.target.selectionStart = e.target.selectionEnd = start + 2
                  setInputCode(e.target.value)
                }
              }}
            />
          </div>

          {/* 输出区域 */}
          <div className="editor-panel">
            <div className="editor-header">
              <span>格式化结果</span>
              <button 
                className="copy-btn"
                onClick={() => copyToClipboard(outputCode, 'output')}
                disabled={!outputCode.trim()}
                title="复制格式化结果 (Ctrl+C)"
              >
                复制
              </button>
            </div>
            
            <textarea
              ref={outputRef}
              value={outputCode}
              readOnly
              placeholder="格式化结果..."
              className="code-editor output-editor"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </ToolPage>
  )
}

export default CodeFormatter
