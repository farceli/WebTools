import React, { useState } from 'react'
import ToolPage from '../components/ToolPage'

const SUPPORTED_FORMATS = ['PDF', 'XLSX', 'DOCX']
const COMMON_FORMATS = ['PDF', 'XLSX', 'DOCX']

function FileGenerator() {
  const [format, setFormat] = useState('PDF')
  const [targetSizeMB, setTargetSizeMB] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStep, setGeneratingStep] = useState('')
  const [generatedFile, setGeneratedFile] = useState(null)
  const [actualSize, setActualSize] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  
  // 保存生成文件时的实际参数，避免修改配置时错误显示
  const [generatedParams, setGeneratedParams] = useState({
    format: '',
    targetSize: 0,
    actualSize: 0,
    accuracy: 0
  })

  const generateRandomBinaryData = (size) => {
    // 直接生成随机二进制数据，性能比字符串拼接快数十倍
    const data = new Uint8Array(size)
    for (let i = 0; i < size; i++) {
      data[i] = Math.floor(Math.random() * 256)
    }
    return data
  }

  const generatePDF = async (targetBytes) => {
    setGeneratingStep('正在生成PDF文件...')
    
    // 极简PDF头部（约300字节）
    const pdfHeader = '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\ntrailer<</Size 4/Root 1 0 R>>\n%%EOF\n'
    
    const headerSize = new Blob([pdfHeader]).size
    const dataSize = Math.max(0, targetBytes - headerSize)
    
    // 生成随机二进制数据填充到目标大小
    const randomData = generateRandomBinaryData(dataSize)
    
    return new Blob([pdfHeader, randomData], { type: 'application/pdf' })
  }

  const generateXLSX = async (targetBytes) => {
    setGeneratingStep('正在生成XLSX文件...')
    
    // 创建一个XML格式的Excel工作表，使用Excel可以识别的XML格式
    let xmlContent = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:x="urn:schemas-microsoft-com:office:excel"
    xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
    xmlns:html="http://www.w3.org/TR/REC-html40">
<Styles>
<Style ss:ID="Default" ss:Name="Normal">
<Alignment ss:Vertical="Bottom"/>
</Style>
</Styles>
<Worksheet ss:Name="Sheet1">
<Table>
<Row>
<Cell><Data ss:Type="String">Column A</Data></Cell>
<Cell><Data ss:Type="String">Column B</Data></Cell>
<Cell><Data ss:Type="String">Column C</Data></Cell>
<Cell><Data ss:Type="String">Random Data</Data></Cell>
</Row>`
    
    // 计算需要多少行来达到目标大小
    const baseSize = xmlContent.length + 100 // 预留结尾标签空间
    const remainingBytes = targetBytes - baseSize
    
    if (remainingBytes > 0) {
      // 每行XML大约150-200字节
      const avgRowSize = 175
      const rowsNeeded = Math.floor(remainingBytes / avgRowSize)
      
      for (let i = 1; i <= Math.min(rowsNeeded, 10000); i++) {
        const randomData1 = Math.random().toString(36).substring(2, 12)
        const randomData2 = Math.random().toString(36).substring(2, 12) 
        const randomData3 = Math.random().toString(36).substring(2, 12)
        const randomData4 = Math.random().toString(36).substring(2, 15)
        
        xmlContent += `
<Row>
<Cell><Data ss:Type="String">${randomData1}</Data></Cell>
<Cell><Data ss:Type="String">${randomData2}</Data></Cell>
<Cell><Data ss:Type="String">${randomData3}</Data></Cell>
<Cell><Data ss:Type="String">${randomData4}</Data></Cell>
</Row>`
      }
    }
    
    // 关闭XML标签
    xmlContent += `
</Table>
</Worksheet>
</Workbook>`
    
    // 精确调整到目标大小
    let currentSize = new Blob([xmlContent]).size
    if (currentSize < targetBytes) {
      // 在最后一个单元格中添加长文本来填充大小
      const paddingNeeded = targetBytes - currentSize - 100 // 预留一些空间
      const paddingText = 'x'.repeat(Math.max(0, paddingNeeded))
      
      // 在结束标签前插入填充数据
      const insertPos = xmlContent.lastIndexOf('</Table>')
      xmlContent = xmlContent.slice(0, insertPos) + 
        `<Row><Cell><Data ss:Type="String">${paddingText}</Data></Cell></Row>` +
        xmlContent.slice(insertPos)
    } else if (currentSize > targetBytes && currentSize > targetBytes * 1.1) {
      // 如果明显超出，截断内容
      xmlContent = xmlContent.substring(0, targetBytes - 50) + '\n</Table>\n</Worksheet>\n</Workbook>'
    }
    
    return new Blob([xmlContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  }

  const generateDOCX = async (targetBytes) => {
    setGeneratingStep('正在生成DOCX文件...')
    
    // 创建一个RTF格式的文档，Word可以识别
    let rtfContent = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs20 Random Document Content\\par
\\par
This is a test document with random data:\\par
\\par`
    
    // 计算需要多少段落来达到目标大小
    const baseSize = rtfContent.length + 50 // 预留结尾空间
    const remainingBytes = targetBytes - baseSize
    
    if (remainingBytes > 0) {
      // 每个段落大约60-80字节
      const avgParagraphSize = 70
      const paragraphsNeeded = Math.floor(remainingBytes / avgParagraphSize)
      
      for (let i = 1; i <= Math.min(paragraphsNeeded, 5000); i++) {
        const randomText1 = Math.random().toString(36).substring(2, 20)
        const randomText2 = Math.random().toString(36).substring(2, 25)
        
        rtfContent += `Paragraph ${i}: ${randomText1} ${randomText2}\\par
`
      }
    }
    
    // 关闭RTF文档
    rtfContent += '\\par\n}'
    
    // 精确调整到目标大小
    let currentSize = new Blob([rtfContent]).size
    if (currentSize < targetBytes) {
      // 添加长文本段落来填充大小
      const paddingNeeded = targetBytes - currentSize - 20 // 预留一些空间
      const paddingText = 'X'.repeat(Math.max(0, paddingNeeded - 20))
      
      // 在结束标签前插入填充文本
      const insertPos = rtfContent.lastIndexOf('}')
      rtfContent = rtfContent.slice(0, insertPos) + 
        `\\par\nPadding Data: ${paddingText}\\par\n` +
        rtfContent.slice(insertPos)
    } else if (currentSize > targetBytes && currentSize > targetBytes * 1.1) {
      // 如果明显超出，截断内容
      rtfContent = rtfContent.substring(0, targetBytes - 10) + '\\par\n}'
    }
    
    return new Blob([rtfContent], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
  }

  const generateRandomFile = async () => {
    // 最终安全检查：严格限制不超过100MB
    const safeSizeMB = Math.min(Math.max(targetSizeMB, 1), 100)
    if (safeSizeMB !== targetSizeMB) {
      setTargetSizeMB(safeSizeMB)
    }
    
    setIsGenerating(true)
    setGeneratingStep('正在生成文件...')
    
    // 只保留最少的UI更新延迟，类似图片生成器
    await new Promise(resolve => setTimeout(resolve, 50))
    
    try {
      const targetBytes = safeSizeMB * 1024 * 1024
      let blob
      
      // 根据格式生成对应文件
      switch (format) {
        case 'PDF':
          blob = await generatePDF(targetBytes)
          break
        case 'XLSX':
          blob = await generateXLSX(targetBytes)
          break
        case 'DOCX':
          blob = await generateDOCX(targetBytes)
          break
        default:
          throw new Error('不支持的文件格式')
      }
      
      // 精确调整文件大小（无延迟，直接处理）
      let actualBytes = blob.size
      const sizeDiff = Math.abs(actualBytes - targetBytes)
      const diffPercent = sizeDiff / targetBytes
      
      if (diffPercent > 0.05) { // 如果差距超过5%，精确调整
        if (actualBytes < targetBytes) {
          // 添加随机数据
          const additionalData = generateRandomBinaryData(targetBytes - actualBytes)
          blob = new Blob([blob, additionalData], { type: blob.type })
          actualBytes = blob.size
        } else if (actualBytes > targetBytes) {
          // 裁剪到目标大小
          const trimmedData = new Uint8Array(await blob.arrayBuffer()).slice(0, targetBytes)
          blob = new Blob([trimmedData], { type: blob.type })
          actualBytes = blob.size
        }
      }
      
      const actualSizeMB = Math.round(actualBytes / (1024 * 1024))
      const accuracyPercent = Math.max(0, 100 - (Math.abs(actualBytes - targetBytes) / targetBytes * 100))
      
      // 创建下载URL
      const fileUrl = URL.createObjectURL(blob)
      
      // 保存生成时的实际参数
      setGeneratedParams({
        format: format,
        targetSize: safeSizeMB,
        actualSize: actualSizeMB,
        accuracy: accuracyPercent.toFixed(1)
      })
      
      setGeneratedFile(fileUrl)
      setActualSize(actualSizeMB)
      setAccuracy(accuracyPercent.toFixed(1))
      setIsGenerating(false)
      setGeneratingStep('')
      
    } catch (error) {
      console.error('文件生成失败:', error)
      setIsGenerating(false)
      setGeneratingStep('')
      alert('文件生成失败，请重试')
    }
  }

  const downloadFile = () => {
    if (!generatedFile) return
    
    const link = document.createElement('a')
    link.href = generatedFile
    link.download = `random_file_${generatedParams.actualSize}MB.${generatedParams.format.toLowerCase()}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const randomizeSettings = () => {
    setFormat(COMMON_FORMATS[Math.floor(Math.random() * COMMON_FORMATS.length)])
    setTargetSizeMB(1 + Math.floor(Math.random() * 99)) // 1-100MB，严格不超过100
  }

  return (
    <ToolPage
      title="随机附件生成"
      description="生成指定大小的兼容格式文件 (PDF/Excel/Word)"
      icon="📄"
    >
      <div className="tool-content">
        <div className="settings-section">
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="file-format">文件格式</label>
              <select 
                id="file-format" 
                value={format} 
                onChange={(e) => setFormat(e.target.value)}
              >
                {SUPPORTED_FORMATS.map(fmt => (
                  <option key={fmt} value={fmt}>{fmt}</option>
                ))}
              </select>
            </div>
            
            <div className="setting-item">
              <label htmlFor="target-size">目标大小 (MB)</label>
              <input 
                type="number" 
                id="target-size" 
                min="1" 
                max="100"
                value={targetSizeMB}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  // 严格限制不能超过100
                  setTargetSizeMB(Math.min(Math.max(value, 1), 100))
                }}
                onFocus={(e) => {
                  // 聚焦时自动全选输入框内容
                  e.target.select()
                }}
                onBlur={(e) => {
                  // 失去焦点时再次检查
                  const value = parseInt(e.target.value) || 1
                  setTargetSizeMB(Math.min(Math.max(value, 1), 100))
                }}
                onKeyPress={(e) => {
                  // 只允许数字输入
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                    e.preventDefault()
                  }
                }}
              />
            </div>
          </div>
          
          <div className="button-group">
            <button 
              className="primary-btn" 
              onClick={generateRandomFile}
              disabled={isGenerating}
            >
              {isGenerating ? '生成中...' : '生成文件'}
            </button>
            <button 
              className="secondary-btn" 
              onClick={randomizeSettings}
              disabled={isGenerating}
            >
              随机参数
            </button>
          </div>
          
          {isGenerating && (
            <div className="progress-info">
              <div className="progress-step">{generatingStep}</div>
            </div>
          )}
        </div>

        {generatedFile && (
          <div className="image-preview">
            <div className="preview-header">
              <h3>生成结果</h3>
              <div className="image-info">
                <span>格式: {generatedParams.format}</span>
                <span>实际: {generatedParams.actualSize} MB</span>
                <span>目标: {generatedParams.targetSize} MB</span>
                <span className={generatedParams.accuracy >= 95 ? 'accuracy-high' : generatedParams.accuracy >= 90 ? 'accuracy-medium' : 'accuracy-low'}>
                  精度: {generatedParams.accuracy}%
                </span>
              </div>
            </div>
            
            <div className="preview-container">
              <div style={{ 
                padding: '40px', 
                textAlign: 'center', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-sm)',
                border: '2px dashed var(--border-color)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                  {generatedParams.format === 'PDF' ? '📄' : 
                   generatedParams.format === 'XLSX' ? '📊' : '📝'}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {generatedParams.format} 文件已生成
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  大小: {generatedParams.actualSize} MB
                </div>
              </div>
            </div>
            
            <div className="button-group">
              <button className="primary-btn" onClick={downloadFile}>下载文件</button>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

export default FileGenerator
