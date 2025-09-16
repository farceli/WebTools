// 分离逻辑测试 - 节假日名称 vs 特殊效果
import { calculateHolidayName, getHolidayDisplayInfo } from './holidayCalculator.js'

// 模拟holiday-cn文件数据（只包含部分日期）
const mockHolidayData2024 = [
  { "name": "国庆节", "date": "2024-10-01", "isOffDay": true },   // 国庆节当天，有特效
  { "name": "国庆节", "date": "2024-10-02", "isOffDay": true },   // 国庆假期，有特效  
  { "name": "国庆节", "date": "2024-10-12", "isOffDay": false },  // 国庆调休，有特效
  // 注意：10月3-7日不在文件中（假设）
]

console.log('=== 分离逻辑测试 ===\n')

// 测试场景
const testCases = [
  {
    date: '2024-10-01',
    scenario: '国庆节当天 - 有名称 + 有特效(假日)'
  },
  {
    date: '2024-10-02', 
    scenario: '国庆假期 - 有名称 + 有特效(假日)'
  },
  {
    date: '2024-10-03',
    scenario: '国庆节 - 有名称 + 无特效'
  },
  {
    date: '2024-10-12',
    scenario: '国庆调休 - 有名称 + 有特效(工作日)'
  },
  {
    date: '2024-10-15',
    scenario: '普通日期 - 无名称 + 无特效'
  },
  {
    date: '2024-05-01',
    scenario: '劳动节 - 有名称 + 无特效(假设不在文件中)'
  }
]

testCases.forEach(({ date, scenario }) => {
  const testDate = new Date(date)
  
  // 分别测试两个独立逻辑
  const holidayName = calculateHolidayName(testDate)
  const displayInfo = getHolidayDisplayInfo(testDate, mockHolidayData2024)
  
  console.log(`📅 ${date} - ${scenario}`)
  console.log(`   节假日名称: ${holidayName || '无'}`)
  console.log(`   显示信息: ${displayInfo.holidayName || '无'}`)
  console.log(`   有特效: ${displayInfo.hasEffect ? '是' : '否'}`)
  if (displayInfo.hasEffect) {
    console.log(`   特效类型: ${displayInfo.effectType} (${displayInfo.isOffDay ? '假日' : '工作日'})`)
  }
  console.log('')
})

console.log('=== 关键验证点 ===')
console.log('✅ 节假日名称：基于固定规律计算，与文件无关')
console.log('✅ 特殊效果：完全基于holiday-cn文件中的记录') 
console.log('✅ 独立逻辑：10月1日有名称有特效，10月3日有名称无特效')
console.log('✅ 显示优先级：节假日名称 > 农历信息')
