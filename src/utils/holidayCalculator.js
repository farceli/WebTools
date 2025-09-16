// 中国法定节假日计算器
// 根据节假日的固定规律计算节假日名称

import { Lunar, Solar } from 'lunar-javascript'

/**
 * 获取固定日期的节假日
 * @param {Date} date 日期
 * @returns {string|null} 节假日名称
 */
function getFixedHolidays(date) {
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  // 固定公历日期的节假日
  const fixedHolidays = {
    '1-1': '元旦',
    '5-1': '劳动节', 
    '10-1': '国庆节'
  }
  
  const key = `${month}-${day}`
  return fixedHolidays[key] || null
}

/**
 * 获取农历节假日
 * @param {Date} date 日期
 * @returns {string|null} 节假日名称
 */
function getLunarHolidays(date) {
  try {
    const solar = Solar.fromDate(date)
    const lunar = solar.getLunar()
    
    const lunarMonth = lunar.getMonth()
    const lunarDay = lunar.getDay()
    
    // 农历节假日
    if (lunarMonth === 1 && lunarDay === 1) {
      return '春节'
    }
    if (lunarMonth === 5 && lunarDay === 5) {
      return '端午节'
    }
    if (lunarMonth === 8 && lunarDay === 15) {
      return '中秋节'
    }
    
    return null
  } catch (error) {
    return null
  }
}

/**
 * 获取清明节日期（复杂算法，一般在4月4-6日）
 * @param {Date} date 日期
 * @returns {string|null} 节假日名称
 */
function getQingmingHoliday(date) {
  try {
    const solar = Solar.fromDate(date)
    const jieQi = solar.getJieQi()
    
    if (jieQi === '清明') {
      return '清明节'
    }
    
    return null
  } catch (error) {
    // 备用计算：清明节一般在4月4-6日
    const month = date.getMonth() + 1
    const day = date.getDate()
    const year = date.getFullYear()
    
    if (month === 4) {
      // 简化的清明节计算（大多数年份为4月4或5日）
      const estimatedQingming = Math.floor(0.2422 * year - year / 4 - 15.54) + 4
      if (day === estimatedQingming || day === estimatedQingming + 1) {
        return '清明节'
      }
    }
    
    return null
  }
}

/**
 * 计算节假日名称
 * @param {Date} date 日期
 * @returns {string|null} 节假日名称，如果不是节假日返回null
 */
export function calculateHolidayName(date) {
  // 1. 检查固定公历日期
  const fixedHoliday = getFixedHolidays(date)
  if (fixedHoliday) {
    return fixedHoliday
  }
  
  // 2. 检查农历节假日
  const lunarHoliday = getLunarHolidays(date)
  if (lunarHoliday) {
    return lunarHoliday
  }
  
  // 3. 检查清明节
  const qingmingHoliday = getQingmingHoliday(date)
  if (qingmingHoliday) {
    return qingmingHoliday
  }
  
  return null
}

/**
 * 检查是否有文件中的假日效果（用于显示特殊样式）
 * @param {Date} date 日期
 * @param {Array} holidayData 从文件中获取的休息日数据
 * @returns {Object|null} 假日效果信息
 */
export function getHolidayEffectInfo(date, holidayData) {
  // 修复时区问题：使用本地日期格式化，避免时区偏移
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`
  
  const holidayRecord = holidayData.find(item => item.date === dateString)
  
  // 只有在文件中存在记录的日期才有特殊效果
  if (!holidayRecord) {
    return null
  }
  
  return {
    isOffDay: holidayRecord.isOffDay,
    type: holidayRecord.isOffDay ? 'holiday' : 'workday',
    fileHolidayName: holidayRecord.name // 保留文件中的名称作为参考
  }
}

/**
 * 获取完整的节假日显示信息
 * @param {Date} date 日期
 * @param {Array} holidayData 从文件中获取的休息日数据
 * @returns {Object} 显示信息
 */
export function getHolidayDisplayInfo(date, holidayData) {
  // 1. 计算节假日名称（独立逻辑）
  const calculatedName = calculateHolidayName(date)
  
  // 2. 获取文件中的特效信息（独立逻辑）
  const effectInfo = getHolidayEffectInfo(date, holidayData)
  
  return {
    // 节假日名称：基于计算规律
    holidayName: calculatedName,
    
    // 特殊效果：基于文件数据
    hasEffect: effectInfo !== null,
    isOffDay: effectInfo ? effectInfo.isOffDay : null,
    effectType: effectInfo ? effectInfo.type : null
  }
}

/**
 * 获取节假日类型说明
 * @param {string} holidayName 节假日名称
 * @returns {string} 节假日类型说明
 */
export function getHolidayDescription(holidayName) {
  const descriptions = {
    '元旦': '新年第一天',
    '春节': '农历新年',
    '清明节': '清明扫墓节',
    '劳动节': '国际劳动节', 
    '端午节': '农历端午',
    '中秋节': '农历中秋',
    '国庆节': '国庆黄金周'
  }
  
  return descriptions[holidayName] || holidayName
}
