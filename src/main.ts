// import 'babel-polyfill'
import Vue from 'vue'
import './projects/axios'
import './icons'
import '@/projects/menu/plugins/plugins.ts'

import App from './App.vue'
import store from './projects/store'
import { apolloProvider } from './projects/apollo'
import router from './projects/router'

import utils from '@/utils/utils'
import Clipboard from 'clipboard'

import * as api from '@/projects/menu/api/api.config'

// 组件中使用 this.$http 调用 axios

Vue.config.productionTip = false

Vue.prototype.$utils = utils
Vue.prototype.$api = api
Vue.prototype.$Clipboard = Clipboard
/**
 * 获取屏幕宽高
 */
Vue.prototype.getViewportSize = () => {
  const docElm: any = document.documentElement
  return {
    width:
      window.innerWidth ||
     docElm.clientWidth ||
      document.body.clientWidth,
    height:
      window.innerHeight ||
     docElm.clientHeight ||
      document.body.clientHeight
  }
}

new Vue({
  router,
  store,
  apolloProvider,
  render: (h: any) => h(App)
}).$mount('#app')
