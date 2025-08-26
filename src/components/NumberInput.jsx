import React, { useState, useEffect } from 'react'

function NumberInput({ 
  value, 
  onChange, 
  min = 1, 
  max = 100, 
  step = 1, 
  unit = '', 
  label,
  id,
  disabled = false,
  autoSelectOnFocus = false,
  placeholder
}) {
  const [internalValue, setInternalValue] = useState(value || '')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setInternalValue(value || '')
  }, [value])

  const validateAndUpdate = (newValue) => {
    // 移除非数字字符，但保留小数点
    const cleanValue = String(newValue).replace(/[^\d.]/g, '')
    
    if (cleanValue === '') {
      setInternalValue('')
      return
    }

    const numValue = parseFloat(cleanValue)
    
    if (isNaN(numValue)) {
      return
    }

    // 应用范围限制
    const clampedValue = Math.min(Math.max(numValue, min), max)
    
    // 如果step是整数，则确保结果也是整数
    const finalValue = step === 1 ? Math.round(clampedValue) : clampedValue
    
    setInternalValue(finalValue)
    onChange(finalValue)
  }

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setInternalValue(newValue)
  }

  const handleBlur = () => {
    setIsFocused(false)
    validateAndUpdate(internalValue)
  }

  const handleFocus = (e) => {
    setIsFocused(true)
    if (autoSelectOnFocus) {
      e.target.select()
    }
  }

  const handleKeyPress = (e) => {
    // 只允许数字、小数点、退格、删除、方向键
    const allowedKeys = [
      'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Tab', 'Enter'
    ]
    
    if (allowedKeys.includes(e.key)) {
      if (e.key === 'Enter') {
        e.target.blur()
      }
      return
    }

    // 对于整数输入，不允许小数点
    if (step === 1 && e.key === '.') {
      e.preventDefault()
      return
    }

    // 只允许数字和小数点
    if (!/[\d.]/.test(e.key)) {
      e.preventDefault()
    }

    // 防止多个小数点
    if (e.key === '.' && internalValue.includes('.')) {
      e.preventDefault()
    }
  }

  const handleWheel = (e) => {
    if (isFocused) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -step : step
      const currentValue = parseFloat(internalValue) || min
      validateAndUpdate(currentValue + delta)
    }
  }

  return (
    <div className="number-input-wrapper">
      {label && (
        <label 
          htmlFor={id} 
          className="number-input-label"
        >
          {label}
        </label>
      )}
      <div className={`number-input-container ${unit ? 'has-unit' : ''}`}>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={internalValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyPress}
          onWheel={handleWheel}
          disabled={disabled}
          placeholder={placeholder}
          className="number-input"
          aria-describedby={`${id}-range`}
          min={min}
          max={max}
          step={step}
        />
        {unit && <span className="number-input-unit">{unit}</span>}
      </div>
      <div 
        id={`${id}-range`} 
        className="number-input-hint"
      >
        {min} - {max} {unit}
      </div>
    </div>
  )
}

export default NumberInput
