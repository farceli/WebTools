import React from 'react'
import './SkipLink.css'

const SkipLink = () => {
  return (
    <a 
      href="#main-content" 
      className="skip-link"
      onFocus={(e) => e.target.style.transform = 'translateY(0)'}
      onBlur={(e) => e.target.style.transform = 'translateY(-100%)'}
    >
      跳转到主内容
    </a>
  )
}

export default SkipLink
