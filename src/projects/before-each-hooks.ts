import store from './store'
import {Route, RawLocation} from 'vue-router'
import Vue from 'vue'

export default {
  // https://router.vuejs.org/zh-cn/advanced/meta.html
  async checkLoginAuth(to: Route, from: Route, next: (to?: RawLocation | false | ((vm: Vue) => any) | void) => void) {
    // 设置页面的title
    if (to.meta.title) {
      document.title = to.meta.title
    }
    // 对设置了requiresAuth的meta路由验证权限
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // 权限验证方法，根据业务需要自行编写
      const permission = getPermission()

      if (!permission) {
        next({
          path: '/login',
          replace: true
          // query: { redirect: to.fullPath }
        })
      } else {
        if (to.path === '/offerList') {
          const status = await checkStatusFunc()
          if (status === 1) {
            next()
          } else if (status === -1) {
            next({
              path: '/check',
              replace: true
            })
          } else {
            next()
          }
        } else {
          next()
        }
      }
    } else if (to.path === '/newPages.html') {
      // 欢迎页不需要勾子
      next()
    } else {
      // 不需要权限的路由，一定要调用 next()
      next()
    }

    async function checkStatusFunc() {
      if (store.getters.syncMenuData.tokenObj.lesseeKey !== '') { return 0 }
      const { data } = await store.dispatch('orgByMe')
      store.commit('SET_ORG_INFO', data.orgByMe)
      return data.orgByMe.orgStatus
    }
    function getPermission() {
      // 因为采用JWT签名token内包含权限标识，故无需前端权限验证方法，只需有token即可
      if (store.getters.syncMenuData.token) {
        return true
      } else {
        return false
      }
    }
  }
}
