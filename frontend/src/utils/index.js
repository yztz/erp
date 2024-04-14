/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string')) {
      if ((/^[0-9]+$/.test(time))) {
        // support "1548221490638"
        time = parseInt(time)
      } else {
        // support safari
        // https://stackoverflow.com/questions/4310953/invalid-date-in-safari
        time = time.replace(new RegExp(/-/gm), '/')
      }
    }

    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = decodeURIComponent(url.split('?')[1]).replace(/\+/g, ' ')
  if (!search) {
    return {}
  }
  const obj = {}
  const searchArr = search.split('&')
  searchArr.forEach(v => {
    const index = v.indexOf('=')
    if (index !== -1) {
      const name = v.substring(0, index)
      const val = v.substring(index + 1, v.length)
      obj[name] = val
    }
  })
  return obj
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function brightenKeyword(val, keyword) {
  keyword = keyword + ''

  val = val + ''
  if (keyword.length > 0) {
    // 将关键字数组转为正则表达式
    const regex = new RegExp(escapeRegExp(keyword), 'gi')
    // 使用replace方法替换匹配的关键字为带有highlight类的span标签
    return val.replace(regex, match => `<span class="search-highlight">${match}</span>`)
  } else {
    return val
  }
}

export function parseSizes(sizes) {
  // 正则表达式用于验证逗号分隔的尺码（例如 "S,M,L"）和范围的尺码（例如 "35-48"）
  const commaSeparated = /^[a-zA-Z](,[a-zA-Z])*$/g
  const range = /^\d+-\d+$/g

  // 如果是逗号分隔的尺码
  if (commaSeparated.test(sizes)) {
    return sizes.split(',')
  }
  // 如果是范围的尺码
  else if (range.test(sizes)) {
    const rangeElements = sizes.split('-')
    const start = Number(rangeElements[0])
    const end = Number(rangeElements[1])
    if (start > end) {
      return null
    }
    const result = []
    for (let i = start; i <= end; i++) {
      result.push(i.toString())
    }
    return result
  }
  // 如果尺码信息不符合任何已知的格式
  else {
    return null
  }
}

export function concatenateURL(u1, u2) {
  if (u1.endsWith('/') && u2.startsWith('/')) {
    return u1 + u2.substring(1)
  }
  if (!u1.endsWith('/') && !u2.startsWith('/')) {
    return u1 + '/' + u2
  }
  return u1 + u2
}
