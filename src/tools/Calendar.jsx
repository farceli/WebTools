import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Lunar, Solar } from 'lunar-javascript'
import { getMultiYearHolidayData, getSupportedYears } from '../utils/holidayData'
import { getHolidayDisplayInfo, calculateHolidayName } from '../utils/holidayCalculator'
import './Calendar.css'

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date()) // 默认选中当前日期
  const [viewMode, setViewMode] = useState('month') // 'month' | 'year'
  const [holidayData, setHolidayData] = useState({}) // 存储假日数据
  const [currentTime, setCurrentTime] = useState(new Date()) // 实时时间

  // 加载本地假日数据
  useEffect(() => {
    const supportedYears = getSupportedYears()
    const data = getMultiYearHolidayData(supportedYears)
    setHolidayData(data)
  }, [])

  // 实时时间更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // 每秒更新一次

    return () => clearInterval(timer)
  }, [])

  // 检查日期是否为今天
  const isToday = (date) => {
    const today = new Date()
    return today.getFullYear() === date.getFullYear() && 
           today.getMonth() === date.getMonth() && 
           today.getDate() === date.getDate()
  }

  // 检查日期是否被选中
  const isSelected = (date) => {
    return selectedDate.getFullYear() === date.getFullYear() && 
           selectedDate.getMonth() === date.getMonth() && 
           selectedDate.getDate() === date.getDate()
  }

  // 获取假日显示信息（名称和效果分离）
  const getHolidayInfoForDate = useCallback((date) => {
    const year = date.getFullYear()
    const yearData = holidayData[year] || []
    
    // 使用分离的逻辑：名称基于计算，效果基于文件
    return getHolidayDisplayInfo(date, yearData)
  }, [holidayData])

  // 获取农历信息
  const getLunarInfo = (date) => {
    try {
      const solar = Solar.fromDate(date)
      const lunar = solar.getLunar()
      
      // 获取农历日期显示
      const lunarDay = lunar.getDay()
      const lunarMonth = lunar.getMonth()
      
      // 特殊节日
      const festivals = lunar.getFestivals()
      if (festivals && festivals.length > 0) {
        return festivals[0]
      }
      
      // 节气
      const jieQi = lunar.getJieQi()
      if (jieQi) {
        return jieQi
      }
      
      // 显示农历日期
      if (lunarDay === 1) {
        // 初一显示月份
        const lunarMonthNames = ['正月', '二月', '三月', '四月', '五月', '六月', 
                               '七月', '八月', '九月', '十月', '冬月', '腊月']
        return lunarMonthNames[lunarMonth - 1]
      } else {
        // 其他日期显示日
        const lunarDayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                              '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                              '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
        return lunarDayNames[lunarDay - 1] || `${lunarDay}`
      }
    } catch (error) {
      console.error('获取农历信息失败:', error)
      return ''
    }
  }

  // 获取当前月份的所有日期
  const monthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // 当月第一天
    const firstDay = new Date(year, month, 1)
    // 当月最后一天
    const lastDay = new Date(year, month + 1, 0)
    // 第一天是星期几（0=周日，1=周一...），转换为周一开始（0=周一，1=周二...）
    let firstDayWeek = firstDay.getDay()
    firstDayWeek = firstDayWeek === 0 ? 6 : firstDayWeek - 1 // 周日变成6，其他减1
    // 当月有多少天
    const daysInMonth = lastDay.getDate()
    
    // 上个月的最后几天（填充第一周）
    const prevMonth = new Date(year, month, 0)
    const prevMonthDays = prevMonth.getDate()
    
    const days = []
    
    // 添加上个月的日期（灰色显示）
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month - 1, prevMonthDays - i)
      })
    }
    
    // 添加当月的日期
    const today = new Date()
    for (let date = 1; date <= daysInMonth; date++) {
      const fullDate = new Date(year, month, date)
      days.push({
        date,
        isCurrentMonth: true,
        isToday: today.getFullYear() === year && today.getMonth() === month && today.getDate() === date,
        fullDate
      })
    }
    
    // 添加下个月的日期（填充最后一周）
    const remainingDays = 42 - days.length // 6周 × 7天
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month + 1, date)
      })
    }
    
    return days
  }, [currentDate])

  // 获取年份的所有月份
  const yearData = useMemo(() => {
    const year = currentDate.getFullYear()
    const months = []
    const today = new Date()
    
    for (let month = 0; month < 12; month++) {
      months.push({
        month,
        name: `${month + 1}月`,
        isCurrentMonth: today.getFullYear() === year && today.getMonth() === month,
        fullDate: new Date(year, month, 1)
      })
    }
    
    return months
  }, [currentDate])

  // 切换到上个月/年
  const goToPrevious = useCallback((type = null) => {
    if (type === 'year') {
      setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))
    } else if (type === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    } else {
      // 兼容旧的调用方式
      if (viewMode === 'month') {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
      } else {
        setCurrentDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1))
      }
    }
  }, [viewMode])

  // 切换到下个月/年
  const goToNext = useCallback((type = null) => {
    if (type === 'year') {
      setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))
    } else if (type === 'month') {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    } else {
      // 兼容旧的调用方式
      if (viewMode === 'month') {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
      } else {
        setCurrentDate(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1))
      }
    }
  }, [viewMode])

  // 回到今天
  const goToToday = useCallback(() => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }, [])

  // 选择日期
  const selectDate = useCallback((dayData) => {
    setSelectedDate(dayData.fullDate)
    if (!dayData.isCurrentMonth) {
      setCurrentDate(new Date(dayData.fullDate.getFullYear(), dayData.fullDate.getMonth(), 1))
    }
  }, [])

  // 选择月份（年视图中）
  const selectMonth = useCallback((monthData) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthData.month, 1))
    setViewMode('month')
  }, [currentDate])

  // 切换视图模式
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'month' ? 'year' : 'month')
  }, [])

  // 格式化实时时间信息
  const formatCurrentTimeInfo = (time) => {
    const year = time.getFullYear()
    const month = time.getMonth() + 1
    const day = time.getDate()
    const hours = String(time.getHours()).padStart(2, '0')
    const minutes = String(time.getMinutes()).padStart(2, '0')
    const seconds = String(time.getSeconds()).padStart(2, '0')
    
    // 周几
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const weekday = weekdays[time.getDay()]
    
    // 农历信息
    let lunarInfo = ''
    try {
      const solar = Solar.fromDate(time)
      const lunar = solar.getLunar()
      const lunarMonth = lunar.getMonth()
      const lunarDay = lunar.getDay()
      
      const lunarMonthNames = ['正月', '二月', '三月', '四月', '五月', '六月', 
                             '七月', '八月', '九月', '十月', '冬月', '腊月']
      const lunarDayNames = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                            '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                            '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十']
      
      lunarInfo = `${lunarMonthNames[lunarMonth - 1]}${lunarDayNames[lunarDay - 1]}`
    } catch (error) {
      lunarInfo = '农历计算中...'
    }
    
    return {
      date: `${year}年${month}月${day}日`,
      time: `${hours}:${minutes}:${seconds}`,
      weekday,
      lunar: lunarInfo
    }
  }

  return (
    <div className="calendar-container">
      {/* 实时时间显示模块 */}
      <div className="realtime-clock">
        {(() => {
          const timeInfo = formatCurrentTimeInfo(currentTime)
          return (
            <>
              <div className="clock-main">
                <div className="clock-date">{timeInfo.date}</div>
                <div className="clock-time">{timeInfo.time}</div>
              </div>
              <div className="clock-info">
                <div className="clock-weekday">{timeInfo.weekday}</div>
                <div className="clock-lunar">{timeInfo.lunar}</div>
              </div>
            </>
          )
        })()}
      </div>
      
      <div className="calendar-header">
        {/* <div className="period-selector">
          <select className="period-select">
            <option value="假期">假期</option>
            <option value="工作日">工作日</option>
            <option value="全部">全部</option>
          </select>
        </div> */}
        <div className="calendar-nav">
          <div className="year-selector">
            <select 
              value={currentDate.getFullYear()} 
              onChange={(e) => {
                const newDate = new Date(currentDate)
                newDate.setFullYear(parseInt(e.target.value))
                setCurrentDate(newDate)
              }}
              className="year-select"
            >
              {getSupportedYears().map(year => (
                <option key={year} value={year}>
                  {year}年
                </option>
              ))}
            </select>
          </div>
          <div className="month-selector">
            <button onClick={() => goToPrevious('month')} className="nav-btn">
              ＜
            </button>
            <select 
              value={currentDate.getMonth() + 1} 
              onChange={(e) => {
                const newDate = new Date(currentDate)
                newDate.setMonth(parseInt(e.target.value) - 1)
                setCurrentDate(newDate)
              }}
              className="month-select"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}月
                </option>
              ))}
            </select>
            <button onClick={() => goToNext('month')} className="nav-btn">
              ＞
            </button>
          </div>
        </div>
        <button onClick={goToToday} className="today-btn">
          今天
        </button>
      </div>

        <div className="calendar-body">
          {viewMode === 'month' ? (
            <div className="month-view">
            <div className="weekdays">
              {['一', '二', '三', '四', '五', '六', '日'].map((day, index) => (
                <div key={day} className={`weekday ${index >= 5 ? 'weekend' : ''}`}>{day}</div>
              ))}
              </div>
              <div className="days-grid">
                {monthData.map((dayData, index) => {
                  // 判断是否为周末（周六=6, 周日=0）
                  const dayOfWeek = dayData.fullDate.getDay()
                  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
                  
                  const lunarInfo = getLunarInfo(dayData.fullDate)
                  const holidayInfo = getHolidayInfoForDate(dayData.fullDate)
                  
                  // 分离逻辑：显示内容 vs 特殊效果
                  const displayInfo = holidayInfo.holidayName || lunarInfo  // 优先显示节假日名称，否则显示农历
                  const isHoliday = holidayInfo.hasEffect && holidayInfo.isOffDay
                  const isWorkday = holidayInfo.hasEffect && !holidayInfo.isOffDay
                  
                  return (
                    <div
                      key={index}
                      className={`day-cell ${
                        dayData.isCurrentMonth ? 'current-month' : 'other-month'
                      } ${dayData.isToday ? 'today' : ''} ${
                        isSelected(dayData.fullDate) ? 'selected' : ''
                      } ${isWeekend ? 'weekend' : ''} ${
                        isHoliday ? 'holiday' : ''
                      } ${isWorkday ? 'workday' : ''}`}
                      onClick={() => selectDate(dayData)}
                      title={holidayInfo.holidayName ? `${holidayInfo.holidayName}${lunarInfo ? ` (${lunarInfo})` : ''}` : lunarInfo}
                    >
                      <div className="solar-date">{dayData.date}</div>
                      {displayInfo && (
                        <div className={`lunar-date ${
                          isHoliday ? 'holiday-text' : ''
                        } ${isWorkday ? 'workday-text' : ''}`}>
                          {displayInfo}
                        </div>
                      )}
                      
                      {/* 日期角标 */}
                      <div className="date-badges">
                        {dayData.isToday && <span className="badge badge-today">今</span>}
                        {isHoliday && <span className="badge badge-holiday">休</span>}
                        {isWorkday && <span className="badge badge-workday">班</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="year-view">
              <div className="months-grid">
                {yearData.map((monthData) => (
                  <div
                    key={monthData.month}
                    className={`month-cell ${
                      monthData.isCurrentMonth ? 'current-month' : ''
                    }`}
                    onClick={() => selectMonth(monthData)}
                  >
                    {monthData.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  )
}

export default Calendar
