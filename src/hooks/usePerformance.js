import { useCallback, useRef, useEffect, useState } from 'react'

// 防抖Hook
export const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null)
  
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay])
}

// 节流Hook
export const useThrottle = (callback, delay) => {
  const lastRun = useRef(Date.now())
  
  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}

// 防抖值Hook
export const useDebouncedValue = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  
  return debouncedValue
}

// 空闲时间处理Hook
export const useIdleCallback = (callback, timeout = 5000) => {
  const timeoutRef = useRef(null)
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  const scheduleIdleCallback = useCallback(() => {
    clearTimeout(timeoutRef.current)
    
    if (window.requestIdleCallback) {
      window.requestIdleCallback(callbackRef.current, { timeout })
    } else {
      timeoutRef.current = setTimeout(callbackRef.current, timeout)
    }
  }, [timeout])
  
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])
  
  return scheduleIdleCallback
}

// 内存使用监控Hook
export const useMemoryUsage = () => {
  const [memoryInfo, setMemoryInfo] = useState({
    used: 0,
    total: 0,
    percentage: 0
  })
  
  useEffect(() => {
    if (!performance.memory) return
    
    const updateMemoryInfo = () => {
      const { usedJSHeapSize, totalJSHeapSize } = performance.memory
      setMemoryInfo({
        used: Math.round(usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(totalJSHeapSize / 1024 / 1024), // MB
        percentage: Math.round((usedJSHeapSize / totalJSHeapSize) * 100)
      })
    }
    
    updateMemoryInfo()
    const interval = setInterval(updateMemoryInfo, 5000) // 每5秒更新
    
    return () => clearInterval(interval)
  }, [])
  
  return memoryInfo
}

// 懒加载Hook
export const useLazyLoad = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [ref, options, hasIntersected])
  
  return { isIntersecting, hasIntersected }
}

// 图片预加载Hook
export const useImagePreload = (imageSrcs) => {
  const [loadedImages, setLoadedImages] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  
  useEffect(() => {
    if (!imageSrcs.length) return
    
    setIsLoading(true)
    const imagePromises = imageSrcs.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve({ src, loaded: true })
        img.onerror = () => reject({ src, loaded: false })
        img.src = src
      })
    })
    
    Promise.allSettled(imagePromises).then(results => {
      const loadResults = {}
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          loadResults[result.value.src] = true
        } else {
          loadResults[result.reason.src] = false
        }
      })
      setLoadedImages(loadResults)
      setIsLoading(false)
    })
  }, [imageSrcs])
  
  return { loadedImages, isLoading }
}

// 网络状态监控Hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [connectionType, setConnectionType] = useState('unknown')
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // 检测连接类型（如果支持）
    if ('connection' in navigator) {
      const connection = navigator.connection
      setConnectionType(connection.effectiveType || 'unknown')
      
      const handleConnectionChange = () => {
        setConnectionType(connection.effectiveType || 'unknown')
      }
      
      connection.addEventListener('change', handleConnectionChange)
      
      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return { isOnline, connectionType }
}

// 错误边界Hook
export const useErrorHandler = () => {
  const [error, setError] = useState(null)
  
  const resetError = useCallback(() => {
    setError(null)
  }, [])
  
  const captureError = useCallback((error, errorInfo = {}) => {
    console.error('Error captured:', error, errorInfo)
    setError({ error, errorInfo, timestamp: Date.now() })
    
    // 可以在这里添加错误上报逻辑
    if (window.reportError) {
      window.reportError(error, errorInfo)
    }
  }, [])
  
  return { error, resetError, captureError }
}

export default {
  useDebounce,
  useThrottle,
  useDebouncedValue,
  useIdleCallback,
  useMemoryUsage,
  useLazyLoad,
  useImagePreload,
  useNetworkStatus,
  useErrorHandler
}
