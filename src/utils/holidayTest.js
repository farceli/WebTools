// 假日计算逻辑测试
import { calculateHolidayName, getCalculatedHolidayInfo } from './holidayCalculator.js'

// 测试用例
const testCases = [
  { date: '2024-01-01', expected: '元旦' },
  { date: '2024-05-01', expected: '劳动节' },
  { date: '2024-10-01', expected: '国庆节' },
  { date: '2024-02-10', expected: '春节' }, // 2024年春节
  { date: '2024-04-04', expected: '清明节' }, // 2024年清明节
  { date: '2024-06-10', expected: '端午节' }, // 2024年端午节
  { date: '2024-09-17', expected: '中秋节' }, // 2024年中秋节
  { date: '2024-03-15', expected: null }, // 普通日期
]

console.log('=== 假日计算逻辑测试 ===')

testCases.forEach(({ date, expected }) => {
  const testDate = new Date(date)
  const result = calculateHolidayName(testDate)
  const status = result === expected ? '✅' : '❌'
  
  console.log(`${status} ${date}: 期望 "${expected}" -> 实际 "${result}"`)
})

console.log('\n=== 2024年所有法定节假日 ===')

// 测试2024年的所有法定节假日
const holidays2024 = [
  '2024-01-01', // 元旦
  '2024-02-10', // 春节
  '2024-04-04', // 清明节 
  '2024-05-01', // 劳动节
  '2024-06-10', // 端午节
  '2024-09-17', // 中秋节
  '2024-10-01', // 国庆节
]

holidays2024.forEach(dateStr => {
  const date = new Date(dateStr)
  const name = calculateHolidayName(date)
  console.log(`${dateStr}: ${name}`)
})
