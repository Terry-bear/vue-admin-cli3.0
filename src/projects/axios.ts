'use strict'

import Vue from 'vue'
import axios from 'axios'
import router from './router'
import store from './store'

// Full config:  https://github.com/axios/axios#request-config
// axios.defaults.baseURL = process.env.baseURL || process.env.apiUrl || '';
// axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
// axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const config = {
  // baseURL: process.env.baseURL || process.env.apiUrl || ""
  // timeout: 60 * 1000, // Timeout
  // withCredentials: true, // Check cross-site Access-Control
}

const _axios = axios.create(config)

_axios.interceptors.request.use(
  (cfg) => {
    // todo 处理是否存在token的登录验证
  //   const token = (store as any).state.token
  //   if (token) {
  //   // 每次请求都为http头增加Authorization字段，其内容为 token
  //   cfg.headers.Authorization = `token ${token}`
  // }
    return cfg
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error)
  }
)

// Add a response interceptor
_axios.interceptors.response.use(
  (response) => {
    // Do something with response data
    return response
  },
  (error) => {
    // todo 异常的全局处理  跳转到登录的路由
    // if (error.response) {
    //   switch (error.response.status) {
    //     case 401:
    //       router.replace({
    //         path: '/login',
    //         query: { redirect: router.currentRoute.fullPath }
    //       })
    //       break
    //     default:
    //       break
    //   }
    // }
    return Promise.reject(error)
  }
)

const pP: any = Plugin.prototype
pP.install = function(vue: any, options: any) {
  (vue as any).axios = _axios
  Object.defineProperties(vue.prototype, {
    axios: {
      get() {
        return _axios
      }
    },
    $axios: {
      get() {
        return _axios
      }
    }
  })
}

Vue.use(pP)

export default Plugin
