import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import ToolPage from '../components/ToolPage'
import { useToast } from '../components/Toast'
import './WordCounter.css'

const WordCounter = () => {
  const [inputText, setInputText] = useState('')
  const [generatedText, setGeneratedText] = useState('')
  const [generateTypes, setGenerateTypes] = useState(['chinese'])
  const [generateLength, setGenerateLength] = useState(100)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const textareaRef = useRef(null)
  const { showToast } = useToast()

  // 全面文字统计算法
  const statistics = useMemo(() => {
    if (!inputText.trim()) {
      return {
        // 基础字符统计
        characters: 0,
        charactersNoSpaces: 0,
        charactersVisible: 0,
        whitespaceChars: 0,
        tabChars: 0,
        newlineChars: 0,
        
        // 词汇统计
        words: 0,
        wordsUnique: 0,
        wordsRepeated: 0,
        longestWordLength: 0,
        averageWordLength: 0,
        
        // 字母和数字统计
        upperCaseLetters: 0,
        lowerCaseLetters: 0,
        letters: 0,
        digits: 0,
        numbers: 0,
        
        // 标点和符号统计
        punctuation: 0,
        specialChars: 0,
        symbols: 0,
        
        // 语言分析
        chineseChars: 0,
        chinesePunctuation: 0,
        englishWords: 0,
        englishChars: 0,
        latinChars: 0,
        unicodeChars: 0,
        
        // 结构分析
        lines: 0,
        paragraphs: 0,
        emptyLines: 0,
        longestLineLength: 0,
        averageLineLength: 0,
        longestParagraphLength: 0,
        averageParagraphLength: 0,
        
        // 句子分析
        sentences: 0,
        questionsCount: 0,
        exclamationsCount: 0,
        statementsCount: 0,
        longestSentenceLength: 0,
        averageSentenceLength: 0,
        averageWordsPerSentence: 0,
        
        // 高级分析
        readingTime: 0,
        readingTimeWords: 0,
        textDensity: 0,
        vocabularyRichness: 0,
        averageWordFrequency: 0,
        complexity: 'Easy',
        
        // 格式统计
        urls: 0,
        emails: 0,
        phoneNumbers: 0,
        dates: 0,
        percentages: 0,
        currencies: 0
      }
    }

    const text = inputText
    
    // === 基础字符统计 ===
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const charactersVisible = text.replace(/\s+/g, ' ').trim().length
    const whitespaceChars = (text.match(/\s/g) || []).length
    const tabChars = (text.match(/\t/g) || []).length
    const newlineChars = (text.match(/\n/g) || []).length
    
    // === 字母和数字统计 ===
    const upperCaseLetters = (text.match(/[A-Z]/g) || []).length
    const lowerCaseLetters = (text.match(/[a-z]/g) || []).length
    const letters = upperCaseLetters + lowerCaseLetters
    const digits = (text.match(/\d/g) || []).length
    const numbers = (text.match(/\b\d+\.?\d*\b/g) || []).length
    
    // === 标点和符号统计 ===
    const punctuation = (text.match(/[.,!?;:。，！？；：""''()（）【】]/g) || []).length
    const specialChars = (text.match(/[@#$%^&*+=<>{}[\]|\\\/~`]/g) || []).length
    const symbols = (text.match(/[^\w\s\u4e00-\u9fff]/g) || []).length
    
    // === 语言分析 ===
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length
    const chinesePunctuation = (text.match(/[\u3000-\u303f\uff00-\uffef]/g) || []).length
    const englishChars = (text.match(/[a-zA-Z]/g) || []).length
    const latinChars = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length
    const unicodeChars = (text.match(/[^\x00-\x7F]/g) || []).length
    
    // === 英文单词统计 ===
    const englishText = text.replace(/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/g, ' ')
    const englishWords = englishText.trim() ? 
      englishText.trim().split(/\s+/).filter(word => /[a-zA-Z]/.test(word)).length : 0
    
    // === 词汇统计 ===
    const words = chineseChars + englishWords
    const wordSet = new Set()
    const wordCounts = new Map()
    
    // 统计中文字符
    if (chineseChars > 0) {
      for (let char of text) {
        if (/[\u4e00-\u9fff]/.test(char)) {
          wordSet.add(char)
          wordCounts.set(char, (wordCounts.get(char) || 0) + 1)
        }
      }
    }
    
    // 统计英文单词
    let longestWordLength = 0
    let totalWordLength = 0
    if (englishWords > 0) {
      const englishWordList = englishText.toLowerCase().split(/\s+/)
        .filter(word => /[a-zA-Z]/.test(word))
        .map(word => word.replace(/[^a-zA-Z]/g, ''))
      
      englishWordList.forEach(word => {
        if (word.length > 0) {
          wordSet.add(word)
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1)
          longestWordLength = Math.max(longestWordLength, word.length)
          totalWordLength += word.length
        }
      })
    }
    
    const wordsUnique = wordSet.size
    const wordsRepeated = Array.from(wordCounts.values()).filter(count => count > 1).length
    const averageWordLength = englishWords > 0 ? Math.round((totalWordLength / englishWords) * 10) / 10 : 0
    
    // === 结构分析 ===
    const lineArray = text.split('\n')
    const lines = lineArray.length
    const emptyLines = lineArray.filter(line => line.trim() === '').length
    const maxLineLength = lineArray.length > 0 ? Math.max(...lineArray.map(line => line.length)) : 0
    const averageLineLength = lines > 0 ? Math.round((characters / lines) * 10) / 10 : 0
    
    const paragraphArray = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const paragraphs = paragraphArray.length
    const longestParagraphLength = paragraphArray.length > 0 ? Math.max(...paragraphArray.map(p => p.length)) : 0
    const averageParagraphLength = paragraphs > 0 ? Math.round((characters / paragraphs) * 10) / 10 : 0
    
    // === 句子分析 ===
    const sentenceArray = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0)
    const sentences = sentenceArray.length
    const questionsCount = (text.match(/[?？]/g) || []).length
    const exclamationsCount = (text.match(/[!！]/g) || []).length
    const statementsCount = sentences - questionsCount - exclamationsCount
    const longestSentenceLength = sentenceArray.length > 0 ? Math.max(...sentenceArray.map(s => s.trim().length)) : 0
    const averageSentenceLength = sentences > 0 ? Math.round((characters / sentences) * 10) / 10 : 0
    const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0
    
    // === 高级分析 ===
    // 阅读时间（中文250字/分钟，英文200词/分钟）
    const chineseReadingTime = chineseChars / 250
    const englishReadingTime = englishWords / 200
    const readingTime = Math.ceil(chineseReadingTime + englishReadingTime) || 1
    const readingTimeWords = Math.ceil(words / 225) || 1 // 平均阅读速度
    
    // 文本密度（非空白字符 / 总字符）
    const textDensity = characters > 0 ? Math.round((charactersNoSpaces / characters) * 100) : 0
    
    // 词汇丰富度（TTR - Type Token Ratio）
    const vocabularyRichness = words > 0 ? Math.round((wordsUnique / words) * 100) : 0
    
    // 平均词频
    const averageWordFrequency = wordsUnique > 0 ? Math.round((words / wordsUnique) * 10) / 10 : 0
    
    // 文本复杂度评估
    let complexity = 'Easy'
    if (averageWordsPerSentence > 20 || averageWordLength > 6 || vocabularyRichness > 80) {
      complexity = 'Hard'
    } else if (averageWordsPerSentence > 15 || averageWordLength > 4 || vocabularyRichness > 60) {
      complexity = 'Medium'
    }
    
    // === 格式统计 ===
    const urls = (text.match(/https?:\/\/[^\s]+/g) || []).length
    const emails = (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []).length
    const phoneNumbers = (text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\b\d{11}\b/g) || []).length
    const dates = (text.match(/\b\d{4}[-/]\d{1,2}[-/]\d{1,2}\b|\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/g) || []).length
    const percentages = (text.match(/\b\d+\.?\d*%/g) || []).length
    const currencies = (text.match(/[$¥€£]\s*\d+\.?\d*|\b\d+\.?\d*\s*(?:元|美元|欧元|英镑)/g) || []).length

    return {
      // 基础字符统计
      characters,
      charactersNoSpaces,
      charactersVisible,
      whitespaceChars,
      tabChars,
      newlineChars,
      
      // 词汇统计
      words,
      wordsUnique,
      wordsRepeated,
      longestWordLength,
      averageWordLength,
      
      // 字母和数字统计
      upperCaseLetters,
      lowerCaseLetters,
      letters,
      digits,
      numbers,
      
      // 标点和符号统计
      punctuation,
      specialChars,
      symbols,
      
      // 语言分析
      chineseChars,
      chinesePunctuation,
      englishWords,
      englishChars,
      latinChars,
      unicodeChars,
      
      // 结构分析
      lines,
      paragraphs,
      emptyLines,
      maxLineLength,
      averageLineLength,
      longestParagraphLength,
      averageParagraphLength,
      
      // 句子分析
      sentences,
      questionsCount,
      exclamationsCount,
      statementsCount,
      longestSentenceLength,
      averageSentenceLength,
      averageWordsPerSentence,
      
      // 高级分析
      readingTime,
      readingTimeWords,
      textDensity,
      vocabularyRichness,
      averageWordFrequency,
      complexity,
      
      // 格式统计
      urls,
      emails,
      phoneNumbers,
      dates,
      percentages,
      currencies
    }
  }, [inputText])

  // 文字生成模板
  const templates = {
    chinese: {
      name: '中文',
      words: [
        '这是', '一段', '随机', '生成', '中文', '文本', '内容', '用于', '测试',
        '占位', '显示', '效果', '实际', '项目', '开发', '过程', '经常', '需要',
        '使用', '填充', '文字', '预览', '页面', '布局', '设计', '样式', '排版',
        '功能', '界面', '用户', '体验', '产品', '服务', '技术', '创新', '发展',
        '管理', '系统', '平台', '数据', '分析', '优化', '解决', '方案', '支持'
      ],
      separator: ''
    },
    english: {
      name: '英文',
      words: [
        'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
        'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
        'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
        'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
        'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
        'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
        'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
        'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'the', 'quick', 'brown',
        'fox', 'jumps', 'over', 'lazy', 'dog', 'hello', 'world', 'test', 'data'
      ],
      separator: ' '
    },
    numbers: {
      name: '数字',
      words: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      separator: ''
    },
    symbols: {
      name: '符号',
      words: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '-', '_', '+', '=', '[', ']', '{', '}', '|', '\\', ';', ':', '"', "'", '<', '>', ',', '.', '?', '/'],
      separator: ''
    },
    spaces: {
      name: '空格',
      words: [' '],
      separator: ''
    }
  }





  // 智能文字生成
  // 复选框处理函数
  const handleTypeChange = useCallback((type, checked) => {
    if (checked) {
      setGenerateTypes(prev => [...prev, type])
    } else {
      setGenerateTypes(prev => prev.filter(t => t !== type))
    }
  }, [])

  const generateText = useCallback(async () => {
    if (generateTypes.length === 0) {
      showToast('请至少选择一种生成类型', 'error')
      return
    }
    
    let result = ''
    let currentLength = 0
    const targetLength = generateLength
    
    // 合并所有选中类型的词汇
    const allWords = []
    generateTypes.forEach(type => {
      const template = templates[type]
      if (template) {
        allWords.push(...template.words)
      }
    })
    
    if (allWords.length === 0) return
    
    while (result.length < targetLength) {
      const randomWord = allWords[Math.floor(Math.random() * allWords.length)]
      
      const remainingLength = targetLength - result.length
      const wordToAdd = randomWord.length > remainingLength 
        ? randomWord.substring(0, remainingLength)
        : randomWord
      
      result += wordToAdd
      
      // 只有勾选空格选项时才添加空格
      if (result.length < targetLength && generateTypes.includes('spaces')) {
        const isEnglish = /^[a-zA-Z]/.test(randomWord)
        
        if (isEnglish && result.length < targetLength - 1) {
          result += ' '
        }
      }
    }
    
    // 清理末尾的空格
    result = result.trim()
    
    setGeneratedText(result)
    
    // 自动复制到剪贴板
    try {
      await navigator.clipboard.writeText(result)
      showToast('已生成并复制到剪贴板', 'success', 2000)
    } catch (error) {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = result
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          showToast('已生成并复制到剪贴板', 'success', 2000)
        } else {
          showToast('文本生成完成！', 'success', 2000)
        }
      } catch (fallbackError) {
        showToast('文本生成完成！', 'success', 2000)
      } finally {
        if (textArea.parentNode) {
          document.body.removeChild(textArea)
        }
      }
    }
  }, [generateTypes, generateLength, templates, showToast])



  // 复制到剪贴板（优化版）
  const copyToClipboard = useCallback(async (text, description = '文本') => {
    try {
      await navigator.clipboard.writeText(text)
      showToast('已复制', 'success', 1500)
    } catch (error) {
      // 降级方案 - 使用隐藏的临时元素
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      textArea.style.opacity = '0'
      textArea.style.pointerEvents = 'none'
      
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        const successful = document.execCommand('copy')
        if (successful) {
          showToast('已复制', 'success', 1500)
        } else {
          showToast('复制失败', 'error', 1500)
        }
      } catch (fallbackError) {
        showToast('复制失败', 'error', 1500)
      } finally {
        // 确保元素被移除
        if (textArea.parentNode) {
          document.body.removeChild(textArea)
        }
      }
    }
  }, [showToast])

  // 清空文本
  const clearText = useCallback(() => {
    setInputText('')
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
    showToast('文本已清空', 'info')
  }, [showToast])

  // 文本处理功能集合
  const textProcessors = {
    // 基础转换
    uppercase: (text) => text.toUpperCase(),
    lowercase: (text) => text.toLowerCase(),
    capitalize: (text) => text.replace(/\b\w/g, l => l.toUpperCase()),
    reverse: (text) => text.split('').reverse().join(''),
    
    // 智能处理
    removeExtraSpaces: (text) => text.replace(/\s+/g, ' ').trim(),
    removeLineBreaks: (text) => text.replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim(),
    addLineBreaks: (text) => text.replace(/[.!?。！？]/g, '$&\n').replace(/\n+/g, '\n').trim(),
    removeNumbers: (text) => text.replace(/\d+/g, '').replace(/\s+/g, ' ').trim(),
    removePunctuation: (text) => text.replace(/[^\w\s\u4e00-\u9fff]/g, '').replace(/\s+/g, ' ').trim(),
    
    // 格式化
    toSentenceCase: (text) => {
      return text.toLowerCase().replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase())
    },
    addPeriods: (text) => {
      return text.split('\n').map(line => {
        const trimmed = line.trim()
        if (trimmed && !/[.!?。！？]$/.test(trimmed)) {
          return trimmed + (/[\u4e00-\u9fff]/.test(trimmed) ? '。' : '.')
        }
        return trimmed
      }).join('\n')
    }
  }

  // 执行文本处理
  const processText = useCallback((processorKey) => {
    if (!inputText.trim()) {
      showToast('请先输入文本', 'warning')
      return
    }
    
    const processor = textProcessors[processorKey]
    if (processor) {
      const processed = processor(inputText)
      setInputText(processed)
      showToast('文本处理完成', 'success')
    }
  }, [inputText, showToast])



  return (
    <ToolPage 
      title="文字统计" 
      icon="📝"
      description="统计文字数量、生成测试文本、文本格式转换"
    >
      <div className="word-counter-container">
        {/* 文字统计区域 */}
        <div className="section">
          <div className="input-container">
            <textarea
              ref={textareaRef}
              id="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入文本..."
              rows={8}
              className="text-input"
            />
            {inputText && (
              <div className="input-actions">
                <button 
                  onClick={() => copyToClipboard(inputText, '文本')} 
                  className="action-btn copy-btn"
                  title="复制文本"
                >
                  📋 复制
                </button>
                <button 
                  onClick={clearText} 
                  className="action-btn clear-btn"
                  title="清空文本"
                >
                  🗑️ 清空
                </button>
              </div>
            )}
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{statistics.characters}</div>
              <div className="stat-label">字符长度</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{statistics.charactersNoSpaces}</div>
              <div className="stat-label">有效内容长度</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{Math.ceil(statistics.characters / 1024 * 100) / 100} KB</div>
              <div className="stat-label">文本大小</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{statistics.lines}</div>
              <div className="stat-label">行数</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{statistics.emptyLines}</div>
              <div className="stat-label">空行数</div>
            </div>
          </div>


        </div>



        {/* 文字生成区域 */}
        <div className="section">
          <div className="generate-controls">
            <div className="controls-row">
              <div className="type-checkboxes">
                {Object.entries(templates).map(([key, template]) => (
                  <label key={key} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={generateTypes.includes(key)}
                      onChange={(e) => handleTypeChange(key, e.target.checked)}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">{template.name}</span>
                  </label>
                ))}
              </div>
              
              <div className="length-control">
                <div className="length-input">
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={generateLength}
                    onChange={(e) => setGenerateLength(parseInt(e.target.value) || 1)}
                    onFocus={(e) => e.target.select()}
                    className="length-field"
                  />
                  <span className="unit-text">长度</span>
                </div>
                <button onClick={generateText} className="generate-btn-small">
                  🎲
                </button>
              </div>
            </div>
          </div>
          
          {generatedText && (
            <div className="result-container">
              <textarea
                value={generatedText}
                onChange={(e) => setGeneratedText(e.target.value)}
                rows={6}
                className="result-text"
                placeholder="生成的文本将显示在这里..."
              />
              {generatedText && (
                <div className="result-actions">
                  <button 
                    onClick={() => copyToClipboard(generatedText, '生成文本')}
                    className="action-btn copy-btn"
                    title="复制文本"
                  >
                    📋 复制
                  </button>
                  <button 
                    onClick={() => setGeneratedText('')}
                    className="action-btn clear-btn"
                    title="清空文本"
                  >
                    🗑️ 清空
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ToolPage>
  )
}

export default WordCounter
