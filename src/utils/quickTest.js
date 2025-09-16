// 快速测试假日逻辑
import { getHolidayDisplayInfo } from './holidayCalculator.js'
import { getHolidayData } from './holidayData.js'

// 测试2024年10月1日
const testDate = new Date('2024-10-01')
const holidayData2024 = getHolidayData(2024)

console.log('=== 快速测试 2024-10-01 ===')
console.log('测试日期:', testDate.toISOString().split('T')[0])
console.log('2024年假日数据长度:', holidayData2024.length)

// 查找具体记录
const dateString = testDate.toISOString().split('T')[0]
const record = holidayData2024.find(item => item.date === dateString)
console.log('找到的记录:', record)

// 测试显示信息
const displayInfo = getHolidayDisplayInfo(testDate, holidayData2024)
console.log('显示信息:', displayInfo)

// 预期结果
console.log('预期结果:')
console.log('- holidayName: "国庆节"')
console.log('- hasEffect: true') 
console.log('- isOffDay: true')
console.log('- effectType: "holiday"')

// 验证
const isCorrect = displayInfo.holidayName === '国庆节' && 
                  displayInfo.hasEffect === true &&
                  displayInfo.isOffDay === true &&
                  displayInfo.effectType === 'holiday'

console.log('测试结果:', isCorrect ? '✅ 通过' : '❌ 失败')

if (!isCorrect) {
  console.log('问题排查:')
  if (!displayInfo.holidayName) console.log('- 节假日名称计算失败')
  if (!displayInfo.hasEffect) console.log('- 特效检测失败')
  if (!displayInfo.isOffDay) console.log('- 休息日检测失败') 
}
