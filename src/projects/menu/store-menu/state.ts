import { setStore, getStore, removeStore } from '@/utils/store'

// 部分参数依赖存储，保证浏览器刷新(sessionStorage)和关闭后使用(localStorage)
const state = {
  leftMenu: getStore({ name: 'leftMenu' }) || [],
  token: getStore({ name: 'token' }) || '',
  userInfo: getStore({ name: 'userInfo' }) || '',
  orgInfo: getStore({ name: 'orgInfo' }) || '',
  tokenObj: getStore({ name: 'tokenObj' }) || '',
  isFirstLogin: getStore({ name: 'isFirstLogin' }) || 'false'
}

export default state
