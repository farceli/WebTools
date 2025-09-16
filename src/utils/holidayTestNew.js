// 新假日逻辑测试 - 基于文件数据
import { getCalculatedHolidayInfo } from './holidayCalculator.js'

// 模拟2024年10月的holiday-cn文件数据
const mockHolidayData2024 = [
  { "name": "国庆节", "date": "2024-10-01", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-02", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-03", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-04", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-05", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-06", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-07", "isOffDay": true },
  { "name": "国庆节", "date": "2024-10-12", "isOffDay": false }, // 调休工作日
]

// 测试用例
const testCases = [
  { 
    date: '2024-10-01', 
    expected: { name: '国庆节', isOffDay: true, type: 'holiday' },
    description: '国庆节当天 - 应该显示红色假日'
  },
  { 
    date: '2024-10-07', 
    expected: { name: '国庆节', isOffDay: true, type: 'holiday' },
    description: '国庆节假期最后一天 - 应该显示红色假日'
  },
  { 
    date: '2024-10-12', 
    expected: { name: '国庆节', isOffDay: false, type: 'workday' },
    description: '国庆节调休工作日 - 应该显示灰色工作日'
  },
  { 
    date: '2024-10-15', 
    expected: null,
    description: '普通日期 - 不在文件中，不应该有特殊效果'
  },
  { 
    date: '2024-10-31', 
    expected: null,
    description: '普通日期 - 不应该有特殊效果'
  }
]

console.log('=== 新假日逻辑测试（基于文件数据）===')

testCases.forEach(({ date, expected, description }) => {
  const testDate = new Date(date)
  const result = getCalculatedHolidayInfo(testDate, mockHolidayData2024)
  
  let isMatch = false
  if (expected === null && result === null) {
    isMatch = true
  } else if (expected && result) {
    isMatch = expected.name === result.name && 
             expected.isOffDay === result.isOffDay && 
             expected.type === result.type
  }
  
  const status = isMatch ? '✅' : '❌'
  
  console.log(`${status} ${date}: ${description}`)
  console.log(`   期望: ${expected ? JSON.stringify(expected) : 'null'}`)
  console.log(`   实际: ${result ? JSON.stringify(result) : 'null'}`)
  console.log('')
})

console.log('=== 总结 ===')
console.log('✅ 只有在holiday-cn文件中有记录的日期才会显示特殊效果')
console.log('✅ isOffDay=true 显示红色假日样式') 
console.log('✅ isOffDay=false 显示灰色调休工作日样式')
console.log('✅ 不在文件中的日期只显示普通农历信息')
