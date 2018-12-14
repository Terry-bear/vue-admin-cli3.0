import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const modules: any = {}

// 追加当前目录公共存储
const commonfiles = require.context(`./store-common`, true, /.+-index\.ts$/)
commonfiles.keys().forEach(key => {
  const k = (key as any).match(/\.\/(\S*)-index\.ts/)[1]
  modules[k] = commonfiles(key).default
})
// 追加项目目录特有存储
const projectfiles = require.context(`./${process.env.VUE_APP_TARGET_PROJECT}/`, true, /.+-index\.ts$/)

projectfiles.keys().forEach(key => {
  const k = (key as any).match(/\/[^/]*$/)[0].match(/\/(\S*)-index\.ts/)[1]
  modules[k] = projectfiles(key).default
})
console.log('modules--->', modules)
export default new Vuex.Store({
  modules,
  strict: process.env.NODE_ENV !== 'production'
})
