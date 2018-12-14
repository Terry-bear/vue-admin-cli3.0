import { MutationTree } from 'vuex'
import { setStore, getStore, removeStore } from '@/utils/store'
import * as ossVar from '@/utils/ossVar.ts'
const mutations: MutationTree<any> = {
  /**
   * todo 设置Token
   *
   */
  setToken(state, token) {
    state.token = token
    console.log('token=' + token)
    setStore({ name: 'token', content: state.token })
  },
  /**
   * todo 设置ORG_INFO
   */
  setOrgInfo(state, orgInfo) {
    state.orgInfo = orgInfo
    // console.log('orgInfo=' + orgInfo)
    setStore({ name: 'orgInfo', content: state.orgInfo })
  },
  /**
   * todo 设置左边菜单栏数据
   */
  setLeftMenu(state, leftMenu) {
    state.leftMenu = leftMenu
    setStore({ name: 'leftMenu', content: state.leftMenu })
  },
  /**
   * todo 设置登录后个人信息
   */
  setUserInfo(state, userInfo) {
    state.userInfo = userInfo
    setStore({ name: 'userInfo', content: state.userInfo })
  },
  /**
   * todo 设置解析的token对象
   */
  setDecodeToken(state, tokenObj) {
    state.tokenObj = tokenObj
    state.tokenObj.url = `${ossVar.defaultPath}/${tokenObj.def}`
    setStore({ name: 'tokenObj', content: state.tokenObj })
  },
  /**
   * todo 判断是否是第一次登陆
   */
  setFirstLogin(state, isFirstLogin) {
    state.isFirstLogin = isFirstLogin
    setStore({ name: 'isFirstLogin', content: state.isFirstLogin })
  },
  /**
   * todo 租户平台信息
   */
  setLesseeInfo(state, lesseeInfo) {
    state.lesseeInfo = lesseeInfo
    setStore({ name: 'lesseeInfo', content: state.lesseeInfo })
  }
}
export default mutations
