// 假日数据导出索引文件
// 这个文件用于确保所有假日数据能被正确导入

export { default as holidays2007 } from './2007.json'
export { default as holidays2008 } from './2008.json'
export { default as holidays2009 } from './2009.json'
export { default as holidays2010 } from './2010.json'
export { default as holidays2011 } from './2011.json'
export { default as holidays2012 } from './2012.json'
export { default as holidays2013 } from './2013.json'
export { default as holidays2014 } from './2014.json'
export { default as holidays2015 } from './2015.json'
export { default as holidays2016 } from './2016.json'
export { default as holidays2017 } from './2017.json'
export { default as holidays2018 } from './2018.json'
export { default as holidays2019 } from './2019.json'
export { default as holidays2020 } from './2020.json'
export { default as holidays2021 } from './2021.json'
export { default as holidays2022 } from './2022.json'
export { default as holidays2023 } from './2023.json'
export { default as holidays2024 } from './2024.json'
export { default as holidays2025 } from './2025.json'
export { default as holidays2026 } from './2026.json'

// 验证数据完整性
export function validateHolidayData() {
  const years = [2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
  
  years.forEach(year => {
    try {
      const data = require(`./${year}.json`)
      console.log(`✅ ${year}年假日数据加载成功，包含 ${data.days ? data.days.length : 0} 条记录`)
    } catch (error) {
      console.error(`❌ ${year}年假日数据加载失败:`, error.message)
    }
  })
}
