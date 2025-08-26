import React, { useState, useEffect } from 'react'
import ToolPage from '../components/ToolPage'

// 数据类型定义
const DATA_TYPES = [
  { id: 'chineseName', name: '姓名', icon: '👤' },
  { id: 'idCard', name: '身份证号', icon: '🆔' },
  { id: 'phone', name: '手机号码', icon: '📱' },
  { id: 'creditCode', name: '社会统一信用代码', icon: '🏢' },
  { id: 'email', name: '邮箱', icon: '📧' },
  { id: 'company', name: '公司名称', icon: '🏭' },
]

// 基础数据
const CHINESE_SURNAMES = [
  // 常见姓氏 (按人口排序)
  '王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕',
  '苏', '卢', '蒋', '蔡', '贾', '丁', '魏', '薛', '叶', '阎'
]

// 按性别和时代分类的名字
const MALE_NAMES = {
  classic: ['建国', '建华', '建军', '志强', '志明', '志勇'],
  modern: [
    // 00后10后流行名字
    '浩然', '子轩', '宇轩', '博文', '天翊', '雨泽', '烨磊', '晟睿', '文昊', '修洁',
    '梓豪', '子涵', '梓轩', '浩宇', '嘉懿', '煜城', '子墨', '宇辰', '梓宸', '浩轩',
    '奕辰', '宇航', '浩博', '梓恒', '子睿', '俊熙', '宇泽', '梓桐', '子皓', '浩铭',
    '梓睿', '俊杰', '宇杰', '子昊', '浩钰', '锦程', '奕博', '梓涵', '子硕', '浩天'
  ],
  simple: ['轩', '宇', '泽', '轩', '豪', '涵', '睿', '博', '杰', '辰', '铭', '恒', '熙', '昊']
}

const FEMALE_NAMES = {
  classic: ['秀英', '秀兰', '桂英', '丽华', '丽娜', '丽芳'],
  modern: [
    // 00后10后流行名字
    '梓涵', '梓萱', '诗涵', '欣怡', '可馨', '雨涵', '佳怡', '思涵', '诗琪', '美琳',
    '若汐', '艺涵', '苡沫', '苡萱', '雨桐', '梓菡', '欣妍', '语桐', '语汐', '语萱',
    '可欣', '语涵', '艺萱', '苡涵', '梓琳', '雨萱', '梓妍', '语晨', '艺洋', '悦涵',
    '梓涵', '苡沫', '雨汐', '语桐', '梓萱', '艺涵', '可馨', '语涵', '梓菡', '欣悦'
  ],
  simple: ['涵', '萱', '汐', '桐', '欣', '悦', '琳', '妍', '晨', '洋', '菡', '沫', '怡', '萌']
}
const ENGLISH_FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen']
const ENGLISH_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
const EMAIL_DOMAINS = ['gmail.com', 'qq.com', '163.com', 'sina.com', 'hotmail.com', 'outlook.com', 'yahoo.com', '126.com', 'foxmail.com', 'sohu.com']
const PROVINCES = ['北京市', '上海市', '天津市', '重庆市', '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '海南省']
const CITIES = ['北京市', '上海市', '广州市', '深圳市', '天津市', '重庆市', '苏州市', '成都市', '武汉市', '杭州市', '南京市', '青岛市', '无锡市', '宁波市', '大连市', '佛山市', '沈阳市', '厦门市', '西安市', '长沙市']
const COMPANY_TYPES = ['科技有限公司', '贸易有限公司', '实业有限公司', '投资有限公司', '建设有限公司', '文化传媒有限公司', '教育咨询有限公司', '信息技术有限公司', '网络科技有限公司', '生物科技有限公司']
const COMPANY_PREFIXES = ['华为', '腾讯', '阿里', '百度', '京东', '美团', '字节', '滴滴', '小米', '联想', '海尔', '格力', '万科', '恒大', '中国', '北京', '上海', '广州', '深圳', '天津']

function DataGenerator() {
  const [selectedTypes, setSelectedTypes] = useState({})
  const [generateCount, setGenerateCount] = useState(10)
  const [generatedData, setGeneratedData] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedText, setCopiedText] = useState('')

  // 从localStorage加载用户选择
  useEffect(() => {
    const savedSelection = localStorage.getItem('dataGeneratorSelection')
    if (savedSelection) {
      try {
        setSelectedTypes(JSON.parse(savedSelection))
      } catch (error) {
        console.error('加载用户选择失败:', error)
      }
    } else {
      // 默认选中几个常用的数据类型
      const defaultSelection = {
        chineseName: true,
        phone: true,
        email: true
      }
      setSelectedTypes(defaultSelection)
    }
  }, [])

  // 保存用户选择到localStorage
  const saveSelection = (newSelection) => {
    setSelectedTypes(newSelection)
    localStorage.setItem('dataGeneratorSelection', JSON.stringify(newSelection))
  }

  // 处理数据类型选择
  const handleTypeChange = (typeId, checked) => {
    const newSelection = { ...selectedTypes, [typeId]: checked }
    saveSelection(newSelection)
  }

  // 随机选择数组元素
  const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)]

  // 生成中文姓名
  const generateChineseName = () => {
    const surname = randomChoice(CHINESE_SURNAMES)
    
    // 随机选择性别
    const isMale = Math.random() > 0.5
    const nameCategories = isMale ? MALE_NAMES : FEMALE_NAMES
    
    // 加权选择时代风格 (偏向年轻化)
    const styleWeights = {
      modern: 70,   // 70%概率选择现代名字
      simple: 25,   // 25%概率选择简洁名字  
      classic: 5    // 5%概率选择经典名字
    }
    
    const random = Math.random() * 100
    let selectedStyle = 'modern'
    if (random <= styleWeights.classic) {
      selectedStyle = 'classic'
    } else if (random <= styleWeights.classic + styleWeights.simple) {
      selectedStyle = 'simple'
    } else {
      selectedStyle = 'modern'
    }
    
    const namePool = nameCategories[selectedStyle]
    
    // 选择名字
    let name = ''
    if (selectedStyle === 'simple') {
      // 单字名或双字名
      if (Math.random() > 0.6) {
        // 40%概率双字名
        name = randomChoice(namePool) + randomChoice(namePool.filter(n => n !== name.slice(-1)))
      } else {
        // 60%概率单字名
        name = randomChoice(namePool)
      }
    } else {
      // classic和modern直接使用双字名
      name = randomChoice(namePool)
    }
    
    return surname + name
  }

  // 生成英文姓名
  const generateEnglishName = () => {
    return `${randomChoice(ENGLISH_FIRST_NAMES)} ${randomChoice(ENGLISH_LAST_NAMES)}`
  }

  // 生成身份证号
  const generateIdCard = () => {
    // 真实地区代码
    const areaCodes = [
      '110101', '110102', '110105', '110106', // 北京
      '310101', '310104', '310105', '310106', // 上海
      '440101', '440103', '440104', '440105', // 广州
      '440301', '440303', '440304', '440305', // 深圳
      '320101', '320102', '320104', '320111', // 南京
      '330101', '330102', '330103', '330104', // 杭州
    ]
    const areaCode = randomChoice(areaCodes)
    
    // 更真实的年龄分布 (25-65岁)
    const currentYear = new Date().getFullYear()
    const age = 25 + Math.floor(Math.random() * 40)
    const year = currentYear - age
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')
    const birthDate = `${year}${month}${day}`
    
    // 顺序码 (奇数男，偶数女)
    const sequence = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')
    
    const id17 = areaCode + birthDate + sequence
    
    // 计算校验位
    const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
    
    let sum = 0
    for (let i = 0; i < 17; i++) {
      sum += parseInt(id17[i]) * weights[i]
    }
    const checkCode = checkCodes[sum % 11]
    
    return id17 + checkCode
  }

  // 生成手机号
  const generatePhone = () => {
    // 真实的手机号前缀 (按运营商分类)
    const chinaMobile = ['134', '135', '136', '137', '138', '139', '147', '150', '151', '152', '157', '158', '159', '172', '178', '182', '183', '184', '187', '188', '198']
    const chinaUnicom = ['130', '131', '132', '145', '155', '156', '166', '171', '175', '176', '185', '186', '196']
    const chinaTelecom = ['133', '149', '153', '173', '174', '177', '180', '181', '189', '199']
    
    const allPrefixes = [...chinaMobile, ...chinaUnicom, ...chinaTelecom]
    const prefix = randomChoice(allPrefixes)
    
    // 避免生成过于规律的号码
    let suffix = ''
    for (let i = 0; i < 8; i++) {
      if (i === 0) {
        // 第一位不为0
        suffix += Math.floor(Math.random() * 9) + 1
      } else {
        suffix += Math.floor(Math.random() * 10)
      }
    }
    
    return prefix + suffix
  }

  // 生成社会统一信用代码
  const generateCreditCode = () => {
    // 简化版本，实际应该有更复杂的校验算法
    const chars = '0123456789ABCDEFGHJKLMNPQRTUWXY'
    let code = '91' // 机构类别代码
    for (let i = 0; i < 15; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    // 最后一位校验码简化处理
    code += chars[Math.floor(Math.random() * chars.length)]
    return code
  }

  // 生成邮箱
  const generateEmail = () => {
    // 更真实的用户名生成策略
    const nameStyles = [
      // 拼音风格
      () => {
        const surnames = ['zhang', 'wang', 'li', 'zhao', 'liu', 'chen', 'yang', 'huang', 'zhou', 'wu']
        const names = ['wei', 'fang', 'na', 'min', 'jing', 'li', 'qiang', 'lei', 'jun', 'yang']
        return randomChoice(surnames) + randomChoice(names)
      },
      // 英文风格
      () => {
        const words = ['sunny', 'happy', 'lucky', 'smart', 'cool', 'super', 'nice', 'good', 'best', 'love']
        return randomChoice(words) + (Math.floor(Math.random() * 99) + 1)
      },
      // 数字组合
      () => {
        const prefixes = ['user', 'hello', 'test', 'demo', 'admin', 'guest']
        return randomChoice(prefixes) + Math.floor(Math.random() * 9999 + 1000)
      }
    ]
    
    const generateUsername = randomChoice(nameStyles)
    const username = generateUsername()
    const domain = randomChoice(EMAIL_DOMAINS)
    
    return `${username}@${domain}`
  }

  // 生成地址
  const generateAddress = () => {
    const province = randomChoice(PROVINCES)
    const city = randomChoice(CITIES)
    const district = ['朝阳区', '海淀区', '西城区', '东城区', '丰台区', '石景山区'][Math.floor(Math.random() * 6)]
    const street = Math.random().toString(36).substring(2, 6) + '街道'
    const number = Math.floor(Math.random() * 999) + 1 + '号'
    return `${province}${city}${district}${street}${number}`
  }

  // 生成公司名称
  const generateCompany = () => {
    // 更多样的公司名称生成策略
    const strategies = [
      // 地区+行业
      () => {
        const regions = ['北京', '上海', '深圳', '广州', '杭州', '南京', '苏州', '成都', '武汉', '西安']
        const industries = ['科技', '网络', '信息', '智能', '数据', '云计算', '软件', '互联网']
        const types = ['有限公司', '股份有限公司', '科技有限公司']
        return randomChoice(regions) + randomChoice(industries) + randomChoice(types)
      },
      // 品牌+类型
      () => {
        const brands = ['华创', '中科', '新华', '东方', '盛世', '金石', '天元', '宏达', '远大', '联合']
        const suffixes = ['集团', '控股', '投资', '置业', '实业', '发展']
        return randomChoice(brands) + randomChoice(suffixes) + '有限公司'
      },
      // 传统前缀+行业
      () => {
        const prefix = randomChoice(COMPANY_PREFIXES)
        const type = randomChoice(COMPANY_TYPES)
        return prefix + type
      }
    ]
    
    const strategy = randomChoice(strategies)
    return strategy()
  }

  // 生成银行卡号
  const generateBankCard = () => {
    // 简化版银行卡号（16位或19位）
    const length = Math.random() > 0.5 ? 16 : 19
    let cardNumber = ''
    for (let i = 0; i < length; i++) {
      cardNumber += Math.floor(Math.random() * 10)
    }
    return cardNumber
  }

  // 生成日期时间
  const generateDatetime = () => {
    const start = new Date(2020, 0, 1)
    const end = new Date()
    const randomDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
    return randomDate.toLocaleString('zh-CN')
  }

  // 数据生成器映射
  const dataGenerators = {
    chineseName: generateChineseName,
    idCard: generateIdCard,
    phone: generatePhone,
    creditCode: generateCreditCode,
    email: generateEmail,
    company: generateCompany,
  }

  // 生成测试数据
  const generateTestData = async () => {
    const selectedTypeIds = Object.keys(selectedTypes).filter(typeId => selectedTypes[typeId])
    
    if (selectedTypeIds.length === 0) {
      alert('请至少选择一种数据类型')
      return
    }

    setIsGenerating(true)
    
    // 模拟异步处理，避免大量数据生成时卡顿
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const data = []
    for (let i = 0; i < generateCount; i++) {
      const row = { id: i + 1 }
      selectedTypeIds.forEach(typeId => {
        const typeName = DATA_TYPES.find(type => type.id === typeId)?.name || typeId
        row[typeName] = dataGenerators[typeId]()
      })
      data.push(row)
    }
    
    setGeneratedData(data)
    setIsGenerating(false)
  }

  // 导出为JSON
  const exportToJSON = () => {
    if (generatedData.length === 0) return
    
    const dataStr = JSON.stringify(generatedData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `test_data_${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 导出为CSV
  const exportToCSV = () => {
    if (generatedData.length === 0) return
    
    const headers = Object.keys(generatedData[0]).filter(key => key !== 'id')
    const csvContent = [
      headers.join(','),
      ...generatedData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `test_data_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 全选/取消全选
  const handleSelectAll = (selectAll) => {
    const newSelection = {}
    DATA_TYPES.forEach(type => {
      newSelection[type.id] = selectAll
    })
    saveSelection(newSelection)
  }



  // 复制文本到剪贴板
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(''), 2000) // 2秒后清除提示
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  const selectedCount = Object.values(selectedTypes).filter(Boolean).length

  return (
    <ToolPage
      title="测试数据生成"
      description="生成各种类型的测试数据，支持批量导出"
      icon="📊"
    >
      <div className="tool-content">


        {/* 紧凑的控制区域 */}
        <div className="settings-section">
          {/* 数据类型标签 */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: '0.25rem',
            marginBottom: '1rem'
          }}>
            {DATA_TYPES.map(type => (
              <label 
                key={type.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '13px',
                  borderRadius: '12px',
                  border: selectedTypes[type.id] 
                    ? '2px solid var(--accent-primary)' 
                    : '1px solid var(--border-color)',
                  backgroundColor: selectedTypes[type.id] 
                    ? 'rgba(99, 102, 241, 0.15)' 
                    : 'var(--bg-secondary)',
                  color: selectedTypes[type.id] 
                    ? 'var(--accent-primary)' 
                    : 'var(--text-primary)',
                  fontWeight: selectedTypes[type.id] ? '500' : '400',
                  boxShadow: selectedTypes[type.id] 
                    ? '0 2px 6px rgba(99, 102, 241, 0.2)' 
                    : '0 1px 2px rgba(0, 0, 0, 0.05)',
                  transform: selectedTypes[type.id] ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s ease',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!selectedTypes[type.id]) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                    e.currentTarget.style.borderColor = 'var(--accent-primary)'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedTypes[type.id]) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'
                    e.currentTarget.style.borderColor = 'var(--border-color)'
                    e.currentTarget.style.transform = 'none'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTypes[type.id] || false}
                  onChange={(e) => handleTypeChange(type.id, e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: '12px' }}>{type.icon}</span>
                <span>{type.name}</span>
              </label>
            ))}
          </div>
          
          {/* 操作控制条 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ 
                fontSize: '12px', 
                color: selectedCount > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)',
                padding: '0.25rem 0.5rem',
                backgroundColor: selectedCount > 0 ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-tertiary)',
                border: selectedCount > 0 ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-light)',
                borderRadius: '8px',
                fontWeight: selectedCount > 0 ? '500' : '400',
                transition: 'all 0.2s ease'
              }}>
{selectedCount > 0 ? `已选 ${selectedCount}` : `选择 ${selectedCount}`}
              </span>
              <button 
                className="secondary-btn" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                onClick={() => handleSelectAll(true)}
              >
                全选
              </button>
              <button 
                className="secondary-btn" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                onClick={() => handleSelectAll(false)}
              >
                清空
              </button>

            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="number"
                id="generate-count"
                min="1"
                max="1000"
                value={generateCount}
                onChange={(e) => setGenerateCount(Math.min(Math.max(1, parseInt(e.target.value) || 1), 1000))}
                onFocus={(e) => e.target.select()}
                placeholder="数量"
                style={{ 
                  width: '80px', 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '13px',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)'
                }}
              />
              <button 
                className="primary-btn" 
                style={{ padding: '0.25rem 1rem', fontSize: '13px' }}
                onClick={generateTestData}
                disabled={isGenerating || selectedCount === 0}
              >
                {isGenerating ? '生成中...' : '生成'}
              </button>
            </div>
          </div>
        </div>

        {/* 生成结果区域 */}
        {generatedData.length > 0 && (
          <div className="settings-section" style={{ marginTop: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: 'var(--success-color)',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
{generatedData.length} 条数据
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: 'var(--accent-primary)',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '8px',
                  fontWeight: '500'
                }}>
                  {selectedCount} 种类型
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="secondary-btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                  onClick={exportToJSON}
                >
                  JSON
                </button>
                <button 
                  className="secondary-btn" 
                  style={{ padding: '0.25rem 0.5rem', fontSize: '12px' }}
                  onClick={exportToCSV}
                >
                  CSV
                </button>
              </div>
            </div>
            
            <div style={{ 
              maxHeight: '350px', 
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ 
                    backgroundColor: '#f5f7fa', 
                    position: 'sticky', 
                    top: 0,
                    borderBottom: '1px solid var(--border-color)',
                    zIndex: 10
                  }}>
                    <th style={{ 
                      padding: '8px 6px', 
                      textAlign: 'left', 
                      fontWeight: '500',
                      fontSize: '12px',
                      width: '50px'
                    }}>
                      #
                    </th>
                    {Object.keys(generatedData[0]).filter(key => key !== 'id').map(key => (
                      <th 
                        key={key} 
                        style={{ 
                          padding: '8px 6px', 
                          textAlign: 'left',
                          fontWeight: '500',
                          fontSize: '12px',
                          minWidth: '100px'
                        }}
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generatedData.map((row, index) => (
                    <tr key={index}>
                      <td style={{ 
                        padding: '6px', 
                        color: 'var(--text-secondary)',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}>
                        {row.id}
                      </td>
                      {Object.keys(row).filter(key => key !== 'id').map(key => (
                        <td 
                          key={key} 
                          style={{ 
                            padding: '8px 6px',
                            maxWidth: '150px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            backgroundColor: copiedText === row[key] 
                              ? 'rgba(34, 197, 94, 0.1)' 
                              : 'transparent',
                            borderLeft: copiedText === row[key] 
                              ? '3px solid var(--success-color)' 
                              : '3px solid transparent',
                            color: copiedText === row[key]
                              ? 'var(--success-color)'
                              : 'var(--text-primary)',
                            fontWeight: copiedText === row[key] ? '600' : '400'
                          }}
                          title={copiedText === row[key] ? '已复制!' : `点击复制: ${row[key]}`}
                          onClick={() => copyToClipboard(row[key])}
                          onMouseEnter={(e) => {
                            if (copiedText !== row[key]) {
                              e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.08)'
                              e.currentTarget.style.borderLeft = '3px solid var(--accent-primary)'
                              e.currentTarget.style.color = 'var(--accent-primary)'
                              e.currentTarget.style.transform = 'translateX(2px)'
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (copiedText !== row[key]) {
                              e.currentTarget.style.backgroundColor = 'transparent'
                              e.currentTarget.style.borderLeft = '3px solid transparent'
                              e.currentTarget.style.color = 'var(--text-primary)'
                              e.currentTarget.style.transform = 'none'
                            }
                          }}
                        >
                          <div style={{
                            position: 'relative',
                            width: '100%'
                          }}>
                            <span style={{
                              display: 'block',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              width: '100%'
                            }}>
                              {row[key]}
                            </span>
                            {copiedText === row[key] && (
                              <div style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                color: 'white',
                                fontWeight: 'bold',
                                backgroundColor: 'var(--success-color)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                                pointerEvents: 'none',
                                zIndex: 10,
                                animation: 'copyFeedback 0.3s ease-out'
                              }}>
                                <span style={{ fontSize: '9px' }}>✓</span>
                                已复制
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </ToolPage>
  )
}

export default DataGenerator
