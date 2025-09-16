import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGlobalShortcuts } from '../hooks/useKeyboardShortcuts'
import KeyboardHelp from './KeyboardHelp'
import SkipLink from './SkipLink'
import './Layout.css'

const tools = [
  { id: 'calendar', name: '日历查看', path: '/calendar', icon: '📅' },
  { id: 'image-generator', name: '图片生成', path: '/image-generator', icon: '🖼️' },
  { id: 'video-generator', name: '视频生成', path: '/video-generator', icon: '🎬' },
  { id: 'file-generator', name: '附件生成', path: '/file-generator', icon: '📄' },
  { id: 'data-generator', name: '数据生成', path: '/data-generator', icon: '📊' },
  { id: 'word-counter', name: '文字统计', path: '/word-counter', icon: '📝' },
]

// 推荐的外部工具
const externalTools = [
  { name: 'JSON工具', url: 'https://www.json.cn/', icon: 'Json格式化' },
  { name: 'JSONPath', url: 'https://jsonpath.com/', icon: 'JsonPath' },
  { name: '代码对比', url: 'https://www.diffchecker.com/', icon: 'Diff' },
]

// 常用地址
const commonAddresses = [
  { name: 'Python 官网', url: 'https://www.python.org/', icon: '/icons/python.ico' },
  { name: 'Charles 代理工具', url: 'https://www.charlesproxy.com/', icon: '/icons/charles.ico' },
  { name: 'PyCharm IDE', url: 'https://www.jetbrains.com/pycharm/', icon: '/icons/jetbrains.ico' },
  { name: 'LocalSend 文件传输', url: 'https://web.localsend.org/', icon: '/icons/localsend.ico' },
  { name: 'AnotherRedis 客户端', url: 'https://github.com/qishibo/AnotherRedisDesktopManager/releases', icon: '/icons/anotherredis.ico' },
  { name: 'SwitchHosts 管理', url: 'https://switchhosts.vercel.app/zh', icon: '/icons/switchhosts.ico' },
  { name: 'Scrcpy 投屏工具', url: 'https://github.com/Genymobile/scrcpy/releases', icon: '/icons/scrcpy.ico' },
  { name: 'XMind 思维导图', url: 'https://xmind.cn/', icon: '/icons/xmind.ico' },
  { name: 'GitHub 代码托管', url: 'https://github.com/', icon: '/icons/github.ico' },
  { name: 'Escrcpy GUI 版本', url: 'https://github.com/viarotel-org/escrcpy', icon: '/icons/escrcpy.ico' },
]

function Layout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [addressesExpanded, setAddressesExpanded] = useState(false)
  const location = useLocation()
  
  // 启用全局快捷键
  useGlobalShortcuts()

  // 检测移动端和处理响应式
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768
      setIsMobile(mobile)
      if (mobile) {
        setSidebarCollapsed(false) // 移动端不使用collapsed状态
      }
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 移动端路由变化时关闭侧边栏
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location.pathname, isMobile])

  // 处理侧边栏切换
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setSidebarCollapsed(!sidebarCollapsed)
    }
  }

  // 移动端点击遮罩关闭侧边栏
  const handleOverlayClick = () => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }

  return (
    <div className="layout">
      {/* 无障碍跳转链接 */}
      <SkipLink />
      
      {/* 移动端菜单按钮 */}
      {isMobile && (
        <button 
          className="mobile-menu-btn"
          onClick={handleSidebarToggle}
          aria-label="切换导航菜单"
          aria-expanded={sidebarOpen}
        >
          <span className="hamburger-icon">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      )}

      {/* 移动端遮罩层 */}
      {isMobile && sidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${isMobile && sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">
            工具
          </h1>
          <button
            className="collapse-btn"
            onClick={handleSidebarToggle}
            aria-label={isMobile ? (sidebarOpen ? '关闭菜单' : '打开菜单') : (sidebarCollapsed ? '展开侧边栏' : '收起侧边栏')}
          >
            {isMobile ? '✕' : (sidebarCollapsed ? '→' : '←')}
          </button>
        </div>
        
        <nav className="sidebar-nav" role="navigation" aria-label="主导航">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              to={tool.path}
              className={`nav-item ${location.pathname === tool.path ? 'active' : ''}`}
              aria-current={location.pathname === tool.path ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{tool.icon}</span>
              {(!sidebarCollapsed || isMobile) && <span className="nav-text">{tool.name}</span>}
            </Link>
          ))}
        </nav>

        {/* 推荐工具区域 */}
        {(!sidebarCollapsed || isMobile) && (
          <div className="external-tools">
            <div className="external-header">相关工具</div>
            <div className="external-links">
              {externalTools.map((tool, index) => (
                <a
                  key={index}
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                  title={tool.name}
                >
                  <span className="external-icon">{tool.icon}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* 常用地址区域 */}
        {(!sidebarCollapsed || isMobile) && (
          <div className="common-addresses">
            <button 
              className="address-header"
              onClick={() => setAddressesExpanded(!addressesExpanded)}
              aria-expanded={addressesExpanded}
            >
              <span className="address-title">
                <span className="address-icon">🔗</span>
                <span>常用地址</span>
              </span>
              <span className={`address-toggle ${addressesExpanded ? 'expanded' : ''}`}>
                <svg viewBox="0 0 12 8" fill="none">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>
            
            {addressesExpanded && (
              <div className="common-links">
                {commonAddresses.map((address, index) => (
                  <a
                    key={index}
                    href={address.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="common-link"
                    title={address.name}
                  >
                    <img 
                      src={address.icon}
                      alt={address.name}
                      className="common-icon"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        const fallback = document.createElement('span')
                        fallback.textContent = '🌐'
                        fallback.className = 'common-icon-fallback'
                        e.target.parentNode.insertBefore(fallback, e.target)
                      }}
                    />
                    <span className="common-name">{address.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </aside>

      <main className="main-content" id="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
      
      {/* 快捷键帮助 */}
      <KeyboardHelp />
    </div>
  )
}

export default Layout
