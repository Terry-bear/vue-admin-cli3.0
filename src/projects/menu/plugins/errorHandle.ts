import Vue from 'vue'
const fundebug = require('fundebug-javascript')
// !fundebug用户注册获取的apikey
fundebug.apikey = '****'

function formatComponentName(vm: any) {
  if (vm.$root === vm) { return 'root' }
  const name = vm._isVue
    ? (vm.$options && vm.$options.name) ||
      (vm.$options && vm.$options._componentTag)
    : vm.name
  return (
    (name ? 'component <' + name + '>' : 'anonymous component') +
    (vm._isVue && vm.$options && vm.$options.__file
      ? ' at ' + (vm.$options && vm.$options.__file)
      : '')
  )
}

export function errorHandlerByFundebug(err: any, vm: any, info: any) {
  const componentName = formatComponentName(vm)
  const propsData = vm.$options && vm.$options.propsData

  return fundebug.notifyError(err, {
    metaData: {
      componentName,
      propsData,
      info
    }
  })
}

// (() => {
//   if (process.env.NODE_ENV === 'development') {
//     return false
//   } else if (process.env.NODE_ENV === 'production') {
//     // '开发环境引入第三方报错提示'
//     Vue.config.errorHandler = function(err, vm, info) {
//       // handle error
//       // `info` 是 Vue 特定的错误信息，比如错误所在的生命周期钩子
//       // fundebug\formatComponentName 调用错误检查反馈的模块
//       errorHandlerByFundebug(err, vm, info)
//     }
//   }
// })()
