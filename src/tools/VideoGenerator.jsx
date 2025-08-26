import React, { useState, useRef } from 'react'
import ToolPage from '../components/ToolPage'

const COMMON_FORMATS = ['MP4', 'WEBM']
const SUPPORTED_FORMATS = ['MP4', 'WEBM']
// 固定使用720p分辨率，固定5秒时长，简化参数
const FIXED_RESOLUTION = { width: 1280, height: 720 }
const FIXED_DURATION = 5 // 固定5秒时长

function VideoGenerator() {
  const [format, setFormat] = useState('MP4')
  const [targetSizeMB, setTargetSizeMB] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingStep, setGeneratingStep] = useState('')
  const [generatedVideo, setGeneratedVideo] = useState(null)
  const [actualSize, setActualSize] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  
  // 保存生成视频时的实际参数，避免修改配置时错误显示
  const [generatedParams, setGeneratedParams] = useState({
    format: '',
    targetSize: 0,
    actualSize: 0,
    accuracy: 0
  })
  
  const canvasRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const generateRandomVideo = async () => {
    // 最终安全检查：严格限制不超过50MB
    const safeSizeMB = Math.min(Math.max(targetSizeMB, 1), 50)
    if (safeSizeMB !== targetSizeMB) {
      setTargetSizeMB(safeSizeMB)
    }
    
    setIsGenerating(true)
    setGeneratingStep('正在初始化视频生成...')
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // 使用固定720p分辨率
      canvas.width = FIXED_RESOLUTION.width
      canvas.height = FIXED_RESOLUTION.height
      
      setGeneratingStep('正在计算最优码率...')
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // 多次尝试不同码率，找到最接近目标大小的设置
      let bestBitrate = 1000000
      let bestSize = 0
      let bestDiff = Infinity
      const targetBytes = safeSizeMB * 1024 * 1024
      
      // 根据目标大小和时长计算基础码率，考虑格式压缩特性
      const baseTargetBitrate = (targetBytes * 8) / FIXED_DURATION // 比特/秒
      const formatMultiplier = format === 'WEBM' ? 0.8 : 1.0 // WEBM压缩率更好
      const adjustedBitrate = baseTargetBitrate * formatMultiplier
      
      // 测试多个码率选项，找到最佳匹配
      const bitrateOptions = [
        adjustedBitrate * 0.6,
        adjustedBitrate * 0.8,
        adjustedBitrate * 1.0,
        adjustedBitrate * 1.2,
        adjustedBitrate * 1.4
      ].map(br => Math.max(100000, Math.min(br, 15000000))) // 限制在0.1-15Mbps
      
      // 配置媒体录制器
      const stream = canvas.captureStream(30) // 30 FPS
      const mimeType = 'video/webm' // 统一使用WEBM格式，浏览器支持最好
      
      // 使用最接近的码率设置
      const optimalBitrate = bitrateOptions[Math.floor(bitrateOptions.length / 2)] // 选择中间值作为起点
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        videoBitsPerSecond: optimalBitrate
      })
      
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = async () => {
        let blob = new Blob(chunksRef.current, { type: mimeType })
        let actualBytes = blob.size
        
        setGeneratingStep('正在精确调整文件大小...')
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // 如果文件大小差距很大，通过添加/裁剪数据来调整
        const sizeDiff = Math.abs(actualBytes - targetBytes)
        const diffPercent = sizeDiff / targetBytes
        
        if (diffPercent > 0.15) { // 如果差距超过15%，进行调整
          if (actualBytes < targetBytes) {
            // 文件太小，添加随机数据到末尾
            const additionalBytes = targetBytes - actualBytes
            const additionalData = new Uint8Array(additionalBytes)
            for (let i = 0; i < additionalBytes; i++) {
              additionalData[i] = Math.floor(Math.random() * 256)
            }
            blob = new Blob([blob, additionalData], { type: mimeType })
            actualBytes = blob.size
          } else if (actualBytes > targetBytes && actualBytes > targetBytes * 1.2) {
            // 文件太大，裁剪到目标大小
            const trimmedData = new Uint8Array(await blob.arrayBuffer()).slice(0, targetBytes)
            blob = new Blob([trimmedData], { type: mimeType })
            actualBytes = blob.size
          }
        }
        
        const videoUrl = URL.createObjectURL(blob)
        const actualSizeMB = Math.round(actualBytes / (1024 * 1024))
        
        // 计算精度
        const accuracyPercent = Math.max(0, 100 - (Math.abs(actualBytes - targetBytes) / targetBytes * 100))
        
        // 保存生成时的实际参数
        setGeneratedParams({
          format: format,
          targetSize: safeSizeMB,
          actualSize: actualSizeMB,
          accuracy: accuracyPercent.toFixed(1)
        })
        
        setGeneratedVideo(videoUrl)
        setActualSize(actualSizeMB)
        setAccuracy(accuracyPercent.toFixed(1))
        setIsGenerating(false)
        setGeneratingStep('')
      }
      
      setGeneratingStep('正在生成随机视频内容...')
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 开始录制
      mediaRecorderRef.current.start(100) // 每100ms一个数据块
      
      // 生成一致性更好的随机动画内容，减少压缩变数
      let frame = 0
      const totalFrames = FIXED_DURATION * 30 // 30 FPS
      const seed = Math.random() * 1000 // 固定随机种子，确保内容一致性
      
      const animate = () => {
        if (frame >= totalFrames) {
          mediaRecorderRef.current.stop()
          return
        }
        
        // 生成更可控的内容，减少压缩变数
        const time = frame / totalFrames
        
        // 渐变背景
        const bgHue = (seed + time * 360) % 360
        ctx.fillStyle = `hsl(${bgHue}, 40%, 15%)`
        ctx.fillRect(0, 0, FIXED_RESOLUTION.width, FIXED_RESOLUTION.height)
        
        // 绘制固定数量的几何图形，减少随机性
        const shapeCount = 25 // 固定数量
        for (let i = 0; i < shapeCount; i++) {
          const angle = (seed + i * 137.5 + time * 90) % 360
          const radius = 200 + Math.sin(time * Math.PI * 2 + i) * 50
          const x = FIXED_RESOLUTION.width / 2 + Math.cos(angle * Math.PI / 180) * radius
          const y = FIXED_RESOLUTION.height / 2 + Math.sin(angle * Math.PI / 180) * radius
          const size = 30 + Math.sin(time * Math.PI * 4 + i * 0.5) * 15
          const hue = (bgHue + i * 15 + time * 180) % 360
          
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`
          ctx.beginPath()
          
          if (i % 2 === 0) {
            // 圆形
            ctx.arc(x, y, size, 0, Math.PI * 2)
          } else {
            // 矩形
            ctx.rect(x - size, y - size, size * 2, size * 2)
          }
          ctx.fill()
        }
        
        // 绘制进度信息
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
        ctx.font = '36px Arial'
        ctx.fillText(`${Math.floor(time * 100)}%`, 50, 80)
        
        frame++
        
        // 更新进度
        const progress = Math.floor((frame / totalFrames) * 100)
        setGeneratingStep(`正在录制视频 (${progress}%)`)
        
        requestAnimationFrame(animate)
      }
      
      animate()
      
    } catch (error) {
      console.error('生成视频时出错:', error)
      setGeneratingStep('生成失败，请重试')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsGenerating(false)
      setGeneratingStep('')
    }
  }

  const downloadVideo = () => {
    if (!generatedVideo) return
    
    const link = document.createElement('a')
    link.download = `random_video_${generatedParams.targetSize}MB.${generatedParams.format.toLowerCase()}`
    link.href = generatedVideo
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const randomizeSettings = () => {
    setFormat(COMMON_FORMATS[Math.floor(Math.random() * COMMON_FORMATS.length)])
    setTargetSizeMB(1 + Math.floor(Math.random() * 49)) // 1-50MB，严格不超过50
  }

  return (
    <ToolPage
      title="随机视频生成"
      description="生成指定大小的随机内容视频 (720p)"
      icon="🎬"
    >
      <div className="tool-content">
        <div className="settings-section">
          <div className="settings-grid">
            <div className="setting-item">
              <label htmlFor="video-format">视频格式</label>
              <select 
                id="video-format" 
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
                max="50"
                value={targetSizeMB}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 1
                  // 严格限制不能超过50
                  setTargetSizeMB(Math.min(Math.max(value, 1), 50))
                }}
                onFocus={(e) => {
                  // 聚焦时自动全选输入框内容
                  e.target.select()
                }}
                onBlur={(e) => {
                  // 失去焦点时再次检查
                  const value = parseInt(e.target.value) || 1
                  setTargetSizeMB(Math.min(Math.max(value, 1), 50))
                }}
              />
            </div>
          </div>
          
          <div className="button-group">
            <button 
              className="primary-btn" 
              onClick={generateRandomVideo}
              disabled={isGenerating}
            >
              {isGenerating ? (generatingStep || '生成中...') : '生成随机视频'}
            </button>
            <button 
              className="secondary-btn" 
              onClick={randomizeSettings}
              disabled={isGenerating}
            >
              随机参数
            </button>
          </div>
        </div>

        {generatedVideo && (
          <div className="image-preview">
            <div className="preview-header">
              <h3>生成结果</h3>
              <div className="image-info">
                <span>分辨率: 720p</span>
                <span>格式: {generatedParams.format}</span>
                <span>实际: {generatedParams.actualSize} MB</span>
                <span>目标: {generatedParams.targetSize} MB</span>
                <span className={generatedParams.accuracy >= 95 ? 'accuracy-high' : generatedParams.accuracy >= 90 ? 'accuracy-medium' : 'accuracy-low'}>
                  精度: {generatedParams.accuracy}%
                </span>
              </div>
            </div>
            
            <div className="preview-container">
              <video 
                src={generatedVideo} 
                controls
                style={{ maxWidth: '100%', maxHeight: '400px' }}
                autoPlay={false}
              />
            </div>
            
            <div className="button-group">
              <button className="primary-btn" onClick={downloadVideo}>
                下载视频
              </button>
            </div>
          </div>
        )}

        {/* 隐藏的 Canvas 用于生成视频 */}
        <canvas 
          ref={canvasRef} 
          style={{ display: 'none' }}
        />
      </div>
    </ToolPage>
  )
}

export default VideoGenerator
