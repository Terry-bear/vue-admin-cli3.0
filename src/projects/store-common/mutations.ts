import { MutationTree } from 'vuex'
import { setStore, getStore, removeStore } from '@/utils/store'
const mutations: MutationTree<any> = {
  /**
   * todo 设置全屏
   *
   */
  setIsFullscreen(state, payload) {
    if (payload) {
      state.leftWith = 0
    } else {
      state.leftWith = 256
    }
    state.isFullscreen = payload
  },
  /**
   * todo 设置当前Url
   */
  setMainContentUrl(state, payload) {
    console.log('setMainContentUrl=', payload)
    if (payload === null || payload === 'null') {
      payload = '/404'
    }
    /.+\?$/.test(payload)
      ? (state.mainContentUrl = state.mainContentUrl.slice(0, -1))
      : state.mainContentUrl === payload
        ? (state.mainContentUrl = payload + '?')
        : (state.mainContentUrl = payload)
    // state.mainContentUrl = payload
    setStore({
      name: 'mainContentUrl',
      content: state.mainContentUrl,
      type: 'session'
    })
  },
  /**
   * todo 设置选中的index
   */
  setCurrentMenuIndex(state, payload) {
    state.currentMenuIndex = payload
    setStore({
      name: 'currentMenuIndex',
      content: state.currentMenuIndex,
      type: 'session'
    })
  },
  /**
   * todo 设置左菜单栏宽度
   */
  setLeftWith(state, payload) {
    state.leftWith = payload
    setStore({ name: 'leftWith', content: state.leftWith, type: 'session' })
  },
  /**
   * todo 设置缩放
   */
  toggle(state, payload) {
    if (state.leftWith === 256) {
      state.leftWith = 36
      setStore({ name: 'leftWith', content: state.leftWith, type: 'session' })
    } else {
      state.leftWith = 256
      setStore({ name: 'leftWith', content: state.leftWith, type: 'session' })
    }
  }
}
export default mutations
