import Vue from 'vue'
import newPages from './newPages.vue'
// import { apolloProvider } from '@/projects/apollo'
// import utils from '@/utils/utils'
// import * as api from '@/projects/menu/api/api.config'

Vue.config.productionTip = false

// Vue.prototype.$utils = utils
// Vue.prototype.$api = api

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
  // router,
  // store,
  // vueMap,
  // apolloProvider,
  render: (h) => h(newPages)
}).$mount('#apps')
