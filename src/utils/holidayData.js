// 中国法定节假日数据管理
// 数据来源：https://github.com/NateScarlet/holiday-cn

// 导入本地假日数据文件 (2007-2026年)
import holidays2007 from '../data/holidays/2007.json'
import holidays2008 from '../data/holidays/2008.json'
import holidays2009 from '../data/holidays/2009.json'
import holidays2010 from '../data/holidays/2010.json'
import holidays2011 from '../data/holidays/2011.json'
import holidays2012 from '../data/holidays/2012.json'
import holidays2013 from '../data/holidays/2013.json'
import holidays2014 from '../data/holidays/2014.json'
import holidays2015 from '../data/holidays/2015.json'
import holidays2016 from '../data/holidays/2016.json'
import holidays2017 from '../data/holidays/2017.json'
import holidays2018 from '../data/holidays/2018.json'
import holidays2019 from '../data/holidays/2019.json'
import holidays2020 from '../data/holidays/2020.json'
import holidays2021 from '../data/holidays/2021.json'
import holidays2022 from '../data/holidays/2022.json'
import holidays2023 from '../data/holidays/2023.json'
import holidays2024 from '../data/holidays/2024.json'
import holidays2025 from '../data/holidays/2025.json'
import holidays2026 from '../data/holidays/2026.json'

// 假日数据映射 (2007-2026年完整覆盖)
const holidayDataMap = {
  2007: holidays2007.days || [],
  2008: holidays2008.days || [],
  2009: holidays2009.days || [],
  2010: holidays2010.days || [],
  2011: holidays2011.days || [],
  2012: holidays2012.days || [],
  2013: holidays2013.days || [],
  2014: holidays2014.days || [],
  2015: holidays2015.days || [],
  2016: holidays2016.days || [],
  2017: holidays2017.days || [],
  2018: holidays2018.days || [],
  2019: holidays2019.days || [],
  2020: holidays2020.days || [],
  2021: holidays2021.days || [],
  2022: holidays2022.days || [],
  2023: holidays2023.days || [],
  2024: holidays2024.days || [],
  2025: holidays2025.days || [],
  2026: holidays2026.days || []
}

/**
 * 获取指定年份的假日数据
 * @param {number} year 年份
 * @returns {Array} 假日数据数组
 */
export function getHolidayData(year) {
  return holidayDataMap[year] || []
}

/**
 * 检查指定日期是否为假日
 * @param {Date} date 要检查的日期
 * @param {Array} holidayData 假日数据数组
 * @returns {Object|null} 假日信息或null
 */
export function getHolidayInfo(date, holidayData) {
  if (!holidayData || !Array.isArray(holidayData)) {
    return null
  }

  // 修复时区问题：使用本地日期格式化，避免时区偏移
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const dateString = `${year}-${month}-${day}`
  
  const holiday = holidayData.find(item => item.date === dateString)
  
  if (holiday) {
    return {
      name: holiday.name,
      isOffDay: holiday.isOffDay,
      type: holiday.isOffDay ? 'holiday' : 'workday' // holiday: 假日, workday: 调休工作日
    }
  }
  
  return null
}

/**
 * 获取多年假日数据
 * @param {Array<number>} years 年份数组
 * @returns {Object} 年份到假日数据的映射
 */
export function getMultiYearHolidayData(years) {
  const dataMap = {}
  
  years.forEach(year => {
    dataMap[year] = getHolidayData(year)
  })
  
  return dataMap
}

/**
 * 获取支持的年份列表
 * @returns {Array<number>} 支持的年份
 */
export function getSupportedYears() {
  return Object.keys(holidayDataMap).map(year => parseInt(year)).sort((a, b) => a - b)
}

/**
 * 检查指定年份是否被支持
 * @param {number} year 年份
 * @returns {boolean} 是否支持该年份
 */
export function isYearSupported(year) {
  return holidayDataMap.hasOwnProperty(year)
}