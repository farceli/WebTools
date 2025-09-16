// 调试假日显示问题
import { getHolidayDisplayInfo, calculateHolidayName, getHolidayEffectInfo } from './holidayCalculator.js'
import { getHolidayData } from './holidayData.js'

// 调试函数
export function debugHolidayDate(dateString) {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const holidayData = getHolidayData(year)
  
  console.log(`=== 调试日期: ${dateString} ===`)
  console.log(`年份: ${year}`)
  console.log(`假日数据记录数: ${holidayData.length}`)
  
  // 1. 检查节假日名称计算
  const calculatedName = calculateHolidayName(date)
  console.log(`计算的节假日名称: ${calculatedName || '无'}`)
  
  // 2. 检查文件中的记录
  const dateISOString = date.toISOString().split('T')[0]
  console.log(`查找的日期字符串: ${dateISOString}`)
  
  const record = holidayData.find(item => item.date === dateISOString)
  console.log(`文件中的记录:`, record || '无')
  
  // 3. 检查效果信息
  const effectInfo = getHolidayEffectInfo(date, holidayData)
  console.log(`效果信息:`, effectInfo)
  
  // 4. 检查最终显示信息
  const displayInfo = getHolidayDisplayInfo(date, holidayData)
  console.log(`最终显示信息:`, displayInfo)
  
  console.log(`应该有特效: ${displayInfo.hasEffect}`)
  console.log(`应该是假日: ${displayInfo.isOffDay}`)
  console.log('')
  
  return displayInfo
}

// 快速测试几个日期
console.log('=== 假日调试测试 ===')
debugHolidayDate('2024-10-01') // 国庆节
debugHolidayDate('2024-10-12') // 国庆调休  
debugHolidayDate('2024-10-15') // 普通日期
