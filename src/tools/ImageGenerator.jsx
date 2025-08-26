import React, { useState, useRef, useEffect } from 'react'
import ToolPage from '../components/ToolPage'
import NumberInput from '../components/NumberInput'

const COMMON_FORMATS = ['JPEG', 'PNG', 'WEBP']
const SUPPORTED_FORMATS = ['JPEG', 'PNG', 'WEBP', 'BMP']

function ImageGenerator() {
  const [format, setFormat] = useState('PNG')
  const [targetSizeMB, setTargetSizeMB] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStep, setGeneratingStep] = useState('')
  const [error, setError] = useState('')
  const [generatedImage, setGeneratedImage] = useState(null)
  const [actualSize, setActualSize] = useState(0)
  const [actualDimensions, setActualDimensions] = useState({ width: 0, height: 0 })
  const [accuracy, setAccuracy] = useState(0)
  // 保存生成图片时的实际参数，避免修改配置时错误显示
  const [generatedParams, setGeneratedParams] = useState({
    format: '',
    targetSize: 0,
    actualSize: 0,
    dimensions: { width: 0, height: 0 },
    accuracy: 0
  })
  const canvasRef = useRef(null)

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      // 清理Canvas内容
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
      
      // 清理生成的图片URL以释放内存
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage)
      }
    }
  }, [])

  // 清理旧的图片URL
  useEffect(() => {
    return () => {
      if (generatedImage && generatedImage.startsWith('blob:')) {
        URL.revokeObjectURL(generatedImage)
      }
    }
  }, [generatedImage])

  const generateRandomImage = async () => {
    // 最终安全检查：严格限制不超过100MB
    const safeSizeMB = Math.min(Math.max(targetSizeMB, 1), 100)
    if (safeSizeMB !== targetSizeMB) {
      setTargetSizeMB(safeSizeMB)
    }
    
    setIsGenerating(true)
    setGeneratingStep('正在初始化...')
    setError('')
    
    // 使用 setTimeout 让 UI 能够更新
    await new Promise(resolve => setTimeout(resolve, 50))
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      const targetBytes = safeSizeMB * 1024 * 1024
      
      // 根据目标大小估算合适的图片尺寸
      // 更精确的压缩率估算
      let compressionRatio = 1
      if (format === 'JPEG') compressionRatio = 0.08  // JPEG压缩率更精确
      else if (format === 'PNG') compressionRatio = 0.4   // PNG压缩率调整
      else if (format === 'WEBP') compressionRatio = 0.15  // WEBP压缩率调整
      else compressionRatio = 1 // BMP无压缩
      
      // 估算需要的像素数量 (每像素4字节RGBA)
      const estimatedPixels = (targetBytes * compressionRatio) / 4
      const estimatedSize = Math.sqrt(estimatedPixels)
      
      // 使用二分法查找最佳尺寸
      let minSize = 128
      let maxSize = 2048
      let bestWidth = Math.max(minSize, Math.min(maxSize, Math.floor(estimatedSize)))
      let bestHeight = bestWidth
      let bestDataUrl = ''
      let bestBytes = 0
      let bestDiff = Infinity
      
      // 第一阶段：粗略查找最佳尺寸范围
      setGeneratingStep(`正在计算最佳尺寸 (0/15)`)
      await new Promise(resolve => setTimeout(resolve, 10))
      
      for (let attempt = 0; attempt < 15; attempt++) {
        setGeneratingStep(`正在计算最佳尺寸 (${attempt + 1}/15)`)
        await new Promise(resolve => setTimeout(resolve, 10))
        const width = Math.floor((minSize + maxSize) / 2)
        const height = width
        
        // 设置画布尺寸
        canvas.width = width
        canvas.height = height
        
        // 生成随机像素数据
        const imageData = ctx.createImageData(width, height)
        const data = imageData.data
        
        // 填充随机颜色
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor(Math.random() * 256)     // Red
          data[i + 1] = Math.floor(Math.random() * 256) // Green
          data[i + 2] = Math.floor(Math.random() * 256) // Blue
          data[i + 3] = 255                             // Alpha
        }
        
        // 将像素数据绘制到画布
        ctx.putImageData(imageData, 0, 0)
        
        // 根据格式设置质量参数
        let quality = format === 'JPEG' ? 0.95 : 0.9
        
        // 转换为指定格式的数据URL
        const mimeType = format === 'JPEG' ? 'image/jpeg' : 
                        format === 'PNG' ? 'image/png' :
                        format === 'WEBP' ? 'image/webp' : 'image/png'
        
        const dataUrl = canvas.toDataURL(mimeType, quality)
        
        // 计算实际大小
        const base64Length = dataUrl.split(',')[1].length
        const actualBytes = (base64Length * 3) / 4
        
        const diff = Math.abs(actualBytes - targetBytes)
        if (diff < bestDiff) {
          bestDiff = diff
          bestWidth = width
          bestHeight = height
          bestDataUrl = dataUrl
          bestBytes = actualBytes
        }
        
        // 二分法调整范围
        if (actualBytes < targetBytes) {
          minSize = width
        } else {
          maxSize = width
        }
        
        // 如果差距很小就退出
        if (diff < targetBytes * 0.02) { // 2%误差
          break
        }
      }
      
      // 第二阶段：精细调整质量参数（仅对JPEG有效）
      if (format === 'JPEG' && bestDiff > targetBytes * 0.05) {
        setGeneratingStep('正在精细调整质量参数...')
        await new Promise(resolve => setTimeout(resolve, 20))
        canvas.width = bestWidth
        canvas.height = bestHeight
        
        // 重新生成像素数据
        const imageData = ctx.createImageData(bestWidth, bestHeight)
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.floor(Math.random() * 256)
          data[i + 1] = Math.floor(Math.random() * 256)
          data[i + 2] = Math.floor(Math.random() * 256)
          data[i + 3] = 255
        }
        ctx.putImageData(imageData, 0, 0)
        
        // 尝试不同的质量参数
        for (let quality = 0.1; quality <= 1.0; quality += 0.1) {
          const dataUrl = canvas.toDataURL('image/jpeg', quality)
          const base64Length = dataUrl.split(',')[1].length
          const actualBytes = (base64Length * 3) / 4
          
          const diff = Math.abs(actualBytes - targetBytes)
          if (diff < bestDiff) {
            bestDiff = diff
            bestDataUrl = dataUrl
            bestBytes = actualBytes
          }
          
          if (diff < targetBytes * 0.01) { // 1%误差
            break
          }
        }
      }
      
      // 第三阶段：如果还是差距太大，通过添加数据来精确匹配
      if (bestDiff > targetBytes * 0.1) { // 如果差距超过10%
        setGeneratingStep('正在精确匹配文件大小...')
        await new Promise(resolve => setTimeout(resolve, 30))
        // 转换为blob并添加随机数据
        const base64Data = bestDataUrl.split(',')[1]
        const binaryData = atob(base64Data)
        const bytes = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          bytes[i] = binaryData.charCodeAt(i)
        }
        
        if (bestBytes < targetBytes) {
          // 如果文件太小，添加随机数据
          const additionalBytes = targetBytes - bestBytes
          const newBytes = new Uint8Array(bestBytes + additionalBytes)
          newBytes.set(bytes)
          
          // 添加随机数据到文件末尾
          for (let i = bestBytes; i < newBytes.length; i++) {
            newBytes[i] = Math.floor(Math.random() * 256)
          }
          
          // 转换回base64
          let binaryString = ''
          for (let i = 0; i < newBytes.length; i++) {
            binaryString += String.fromCharCode(newBytes[i])
          }
          const mimeType = format === 'JPEG' ? 'image/jpeg' : 
                          format === 'PNG' ? 'image/png' :
                          format === 'WEBP' ? 'image/webp' : 'image/png'
          bestDataUrl = `data:${mimeType};base64,${btoa(binaryString)}`
          bestBytes = targetBytes
        }
      }
      
      setGeneratingStep('完成生成')
      await new Promise(resolve => setTimeout(resolve, 50))
      
      // 计算精度
      const accuracyPercent = Math.max(0, 100 - (Math.abs(bestBytes - targetBytes) / targetBytes * 100))
      const actualSizeMB = Math.round(bestBytes / (1024 * 1024))
      
      // 保存生成时的实际参数
      setGeneratedParams({
        format: format,
        targetSize: safeSizeMB,
        actualSize: actualSizeMB,
        dimensions: { width: bestWidth, height: bestHeight },
        accuracy: accuracyPercent.toFixed(1)
      })
      
      setGeneratedImage(bestDataUrl)
      setActualSize(actualSizeMB)
      setActualDimensions({ width: bestWidth, height: bestHeight })
      setAccuracy(accuracyPercent.toFixed(1))
      
    } catch (error) {
      console.error('生成图片时出错:', error)
      let errorMessage = '生成失败，请重试'
      
      if (error.name === 'QuotaExceededError') {
        errorMessage = '内存不足，请尝试减小目标文件大小'
      } else if (error.message.includes('Canvas')) {
        errorMessage = '图片处理出错，请检查浏览器兼容性'
      } else if (error.message.includes('Network')) {
        errorMessage = '网络错误，请检查网络连接'
      }
      
      setError(errorMessage)
      setGeneratingStep('')
    } finally {
      setIsGenerating(false)
      setGeneratingStep('')
    }
  }

  const downloadImage = () => {
    if (!generatedImage) return
    
    const link = document.createElement('a')
    link.download = `random_image_${generatedParams.targetSize}MB.${generatedParams.format.toLowerCase()}`
    link.href = generatedImage
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
      title="随机图片生成"
      description="生成指定大小和格式的随机内容图片"
      icon="🖼️"
    >
      <div className="tool-content">
        <div className="settings-section">
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="img-format">图片格式</label>
              <select 
                id="img-format" 
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
                  // 阻止输入非数字字符
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                    e.preventDefault()
                  }
                }}
                disabled={isGenerating}
              />
            </div>
          </div>
          
          {error && (
            <div 
              className="error-message" 
              role="alert" 
              aria-live="polite"
            >
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="button-group">
            <button 
              className="primary-btn" 
              onClick={generateRandomImage}
              disabled={isGenerating}
              aria-describedby={error ? "error-message" : undefined}
            >
              {isGenerating ? (generatingStep || '生成中...') : '生成随机图片'}
            </button>
            <button 
              className="secondary-btn" 
              onClick={randomizeSettings}
            >
              随机参数
            </button>
          </div>
        </div>

        {generatedImage && (
          <div className="image-preview">
            <div className="preview-header">
              <h3>生成结果</h3>
              <div className="image-info">
                <span>尺寸: {generatedParams.dimensions.width} × {generatedParams.dimensions.height}</span>
                <span>格式: {generatedParams.format}</span>
                <span>实际: {generatedParams.actualSize} MB</span>
                <span>目标: {generatedParams.targetSize} MB</span>
                <span className={generatedParams.accuracy >= 95 ? 'accuracy-high' : generatedParams.accuracy >= 90 ? 'accuracy-medium' : 'accuracy-low'}>
                  精度: {generatedParams.accuracy}%
                </span>
              </div>
            </div>
            
            <div className="preview-container">
              <img 
                src={generatedImage} 
                alt="Generated random image" 
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
              />
            </div>
            
            <div className="button-group">
              <button className="primary-btn" onClick={downloadImage}>
                下载图片
              </button>
            </div>
          </div>
        )}

        {/* 隐藏的 Canvas 用于生成图片 */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
        />
      </div>
    </ToolPage>
  )
}

export default ImageGenerator
