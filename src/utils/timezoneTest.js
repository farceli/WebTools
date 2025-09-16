// 时区问题测试
console.log('=== 时区问题测试 ===\n')

// 创建测试日期：2024年10月1日
const testDate = new Date(2024, 9, 1) // 注意：月份从0开始，所以9表示10月

console.log('测试日期对象:', testDate)
console.log('本地时间字符串:', testDate.toString())
console.log('UTC时间字符串:', testDate.toUTCString())

// 旧方法（可能有时区问题）
const oldMethod = testDate.toISOString().split('T')[0]
console.log('旧方法 (toISOString):', oldMethod)

// 新方法（修复时区问题）
const year = testDate.getFullYear()
const month = String(testDate.getMonth() + 1).padStart(2, '0')
const day = String(testDate.getDate()).padStart(2, '0')
const newMethod = `${year}-${month}-${day}`
console.log('新方法 (本地格式):', newMethod)

// 检查是否有差异
const hasDifference = oldMethod !== newMethod
console.log('是否有差异:', hasDifference ? '是' : '否')

if (hasDifference) {
  console.log('⚠️  发现时区偏移问题！')
  console.log('旧方法结果:', oldMethod)
  console.log('新方法结果:', newMethod)
} else {
  console.log('✅ 在当前时区下没有偏移问题')
}

// 测试不同时区可能的影响
console.log('\n=== 时区影响分析 ===')
console.log('当前时区偏移:', testDate.getTimezoneOffset(), '分钟')
console.log('如果时区偏移导致日期变化，旧方法会出错')

// 测试边界情况（接近午夜的时间）
const midnightTest = new Date(2024, 9, 1, 0, 30) // 2024-10-01 00:30
console.log('\n午夜测试 (00:30):')
console.log('ISO方法:', midnightTest.toISOString().split('T')[0])
console.log('本地方法:', `${midnightTest.getFullYear()}-${String(midnightTest.getMonth() + 1).padStart(2, '0')}-${String(midnightTest.getDate()).padStart(2, '0')}`)

console.log('\n✅ 修复完成：现在使用本地日期格式，避免时区偏移导致的日期错误')
