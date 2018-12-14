// 配置定义
_Object.prototype = {
  _each(process: any) {
    const _obj = this._obj
    for (const k in _obj) {
      if (_obj.hasOwnProperty(k)) {
        process(k, _obj[k])
      }
    }
    return this
  }
}
function _Object(this: any, obj: any) {
  this._obj = obj
}

Config.prototype = {
  api_server: 'api.geetest.com',
  protocol: 'http://',
  type_path: '/gettype.php',
  fallback_config: {
    slide: {
      static_servers: ['static.geetest.com', 'dn-staticdown.qbox.me'],
      type: 'slide',
      slide: '/static/js/geetest.0.0.0.js'
    },
    fullpage: {
      static_servers: ['static.geetest.com', 'dn-staticdown.qbox.me'],
      type: 'fullpage',
      fullpage: '/static/js/fullpage.0.0.0.js'
    }
  },
  _get_fallback_config() {
    const self = this
    if (isString(self.type)) {
      return self.fallback_config[self.type]
    } else if (self.new_captcha) {
      return self.fallback_config.fullpage
    } else {
      return self.fallback_config.slide
    }
  },
  _extend(obj: any) {
    const self = this
    const asdf: any = new (_Object as any)(obj)
    ._each(function(key: any, value: any) {
      self[key] = value
    })
  }
}
function Config(this: any, config: any) {
  const self = this
  new (_Object as any)(config)._each(function(key: any, value: any) {
    self[key] = value
  })
}

// 全局变量定义
const status: any = {}
const callbacks: any = {}
const document: any = window.document
const head: any = document.getElementsByTagName('head')[0]

// 先期执行
const detect = function() {
  return !!(window as any).Geetest
}
if (detect()) {
  status.slide = 'loaded'
}

// 数据处理工具函数
const isFunction = function(value: any) {
  return (typeof value === 'function')
}
const isObject = function(value: any) {
  return (typeof value === 'object' && value !== null)
}
const isNumber = function(value: any) {
  return (typeof value === 'number')
}
const isBoolean = function(value: any) {
  return (typeof value === 'boolean')
}
const isString = function(value: any) {
  return (typeof value === 'string')
}
const random = function() {
  return parseInt((window as any).Math.random() * 10000 + '', undefined) + (new Date()).valueOf()
}

// URL处理工具函数
const normalizePath = function(path: any) {
  path = path.replace(/\/+/g, '/')
  if (path.indexOf('/') !== 0) {
    path = '/' + path
  }
  return path
}
const normalizeQuery = function(query: any) {
  if (!query) {
    return ''
  }
  let q = '?'
  new (_Object as any)(query)._each(function(key: any, value: any) {
    if (isString(value) || isNumber(value) || isBoolean(value)) {
      q = q + encodeURIComponent(key) + '=' + encodeURIComponent(value) + '&'
    }
  })
  if (q === '?') {
    q = ''
  }
  return q.replace(/&$/, '')
}
const normalizeDomain = function(domain: any) {
  return domain.replace(/^https?:\/\/|\/$/g, '')
}
const makeURL = function(protocol: any, domain: any, path: any, query: any) {
  domain = normalizeDomain(domain)

  let url = normalizePath(path) + normalizeQuery(query)
  if (domain) {
    url = protocol + domain + url
  }

  return url
}

// 跨域处理
const jsonp = function(domains: any, path: any, config: any, callback: any) {
  if (isObject(config.getLib)) {
    config._extend(config.getLib)
    callback(config)
    return
  }
  if (config.offline) {
    callback(config._get_fallback_config())
    return
  }
  const cb = 'geetest_' + random()
  const wd: any = window
  wd[cb] = function(data: any) {
    if (data.status === 'success') {
      callback(data.data)
    } else if (!data.status) {
      callback(data)
    } else {
      callback(config._get_fallback_config())
    }
    wd[cb] = undefined
    try {
      delete wd[cb]
    } catch (e) {
      console.log(e)
    }
  }
  load(config.protocol, domains, path, {
    gt: config.gt,
    callback: cb
  }, function(err: any) {
    if (err) {
      callback(config._get_fallback_config())
    }
  })
}

// 错误处理
const throwError = function(errorType: any, config: any) {
  const errors: any = {
    networkError: '网络错误'
  }
  if (typeof config.onError === 'function') {
    config.onError(errors[errorType])
  } else {
    throw new Error(errors[errorType])
  }
}

// js加载
const loadScript = function(url: any, cb1: any) {
  const script = document.createElement('script')
  script.charset = 'UTF-8'
  script.async = true
  script.onerror = function() {
    cb1(true)
  }
  let loaded = false
  script.onload = script.onreadystatechange = function() {
    if (!loaded &&
      (!script.readyState ||
        script.readyState === 'loaded' ||
        script.readyState === 'complete')) {
      loaded = true
      setTimeout(function() {
        cb1(false)
      }, 0)
    }
  }
  script.src = url
  head.appendChild(script)
}

const load = function(protocol: any, domains: any, path: any, query: any, cb1: any) {
  const tryRequest = function(at: any) {
    const url = makeURL(protocol, domains[at], path, query)
    loadScript(url, function(err: any) {
      if (err) {
        if (at >= domains.length - 1) {
          cb1(true)
        } else {
          tryRequest(at + 1)
        }
      } else {
        cb1(false)
      }
    })
  }
  tryRequest(0)
}

export const initGeetest = (userConfig: any, callback: any) => {
  const config = new (Config as any)(userConfig)
  if (userConfig.https) {
    config.protocol = 'https://'
  } else if (!userConfig.protocol) {
    config.protocol = window.location.protocol + '//'
  }
  jsonp([config.api_server || config.apiserver], config.type_path, config, function(newConfig: any) {
    const type = newConfig.type
    const init = function() {
      config._extend(newConfig)
      callback(new (window as any).Geetest(config))
    }
    callbacks[type] = callbacks[type] || []
    const s = status[type] || 'init'
    if (s === 'init') {
      status[type] = 'loading'
      callbacks[type].push(init)
      load(config.protocol, newConfig.static_servers || newConfig.domains, newConfig[type] || newConfig.path, null, function(err: any) {
        if (err) {
          status[type] = 'fail'
          throwError('networkError', config)
        } else {
          status[type] = 'loaded'
          const cbs = callbacks[type]
          for (let i = 0, len = cbs.length; i < len; i = i + 1) {
            const cb = cbs[i]
            if (isFunction(cb)) {
              cb()
            }
          }
          callbacks[type] = []
        }
      })
    } else if (s === 'loaded') {
      init()
    } else if (s === 'fail') {
      throwError('networkError', config)
    } else if (s === 'loading') {
      callbacks[type].push(init)
    }
  })
}
