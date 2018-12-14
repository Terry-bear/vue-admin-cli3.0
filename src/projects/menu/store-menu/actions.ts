import { ActionTree } from 'vuex'
import * as O from '@/projects/menu/graphql/org.gql'
import * as A from '@/projects/menu/graphql/auth.gql'
import * as M from '@/projects/menu/graphql/menu.gql'
const actions: ActionTree<any, any> = {
  async fetchOrgInfo({ commit, state, dispatch }, pThis) {
    try {
      const { data } = await pThis.$apolloProvider.clients.org.query({
        query: O.orgByMe,
        variables: {
          token: (this as any).getters.token,
          orgNo: (this as any).getters.tokenObj.def
        },
        fetchPolicy: 'network-only'
      })
      await commit('setOrgInfo', pThis.$utils.deepCopy(data.orgByMe))
    } catch (error) {
      throw new Error(`query--orgByMe-->${error}`)
    }
  },
  async fetchUserInfo({ commit, state, dispatch }, pThis) {
    try {
      const resData = await pThis.$apollo.query({
        query: A.userByMe,
        variables: {
          token: (this as any).getters.token
        },
        // 不在本地缓存,值通过网络
        fetchPolicy: 'network-only'
      })
      // 用户名,姓名,身份证,手机号,邮箱,头像,状态信息,最近修改密码时间,最近登录时间
      // certifiedStatus: Int 1 0 不能修改身份证和姓名
      await commit('setUserInfo', resData.data.userByMe)
    } catch (error) {
      throw new Error(`query--userByMe-->${error}`)
    }
  },
  loginByUserName({ commit, state, dispatch }, pThis) {
    return new Promise((resolve, reject) => {
      // console.log('user._this=' + user._this)
      pThis.loginForm._this.$apollo
        .mutate({
          mutation: A.newTokenByUserName,
          variables: {
            userName: pThis.loginForm.username,
            password: pThis.loginForm.password,
            challenge: pThis.loginForm.challenge,
            validate: pThis.loginForm.validate,
            seccode: pThis.loginForm.seccode,
            serverNos: [],
            companyNos: []
          }
        })
        .then((res: any) => {
          const token = res.data.newTokenByUserName.token
          // console.log('token=' + token)
          commit('setToken', token)
          commit('setFirstLogin', 'true')
          resolve()
        })
        .catch((err: any) => {
          console.log(err.message, 'haha')
          if (err.message === 'GraphQL error: UserName or Password erro') {
            pThis.$message({
              message: '用户名或密码错误!',
              type: 'warning'
            })
            setTimeout(() => {
              location.reload()
            }, 1500)
          } else {
            pThis.$message({
              message: '哦哦,不小心失败了,请刷新!',
              type: 'error'
            })
            throw new Error(`登录失败${err}`)
          }
        })
    })
  },
  loginByPhone({ commit, state, dispatch }, thisDate) {
    const user = thisDate.loginForm
    return new Promise((resolve, reject) => {
      console.log('user._this=' + user._this)
      user._this.$apollo
        .mutate({
          mutation: A.newTokenByMobileNo,
          variables: {
            mobileNo: user.mobileNo,
            verifyCode: user.verifyCode,
            serverNos: [],
            companyNos: []
          }
        })
        .then((res: any) => {
          const token = res.data.newTokenByMobileNo.token
          // console.log('token=' + token)
          commit('setToken', token)
          commit('setFirstLogin', 'true')
          resolve()
        })
        .catch((err: any) => {
          const errors = JSON.parse(JSON.stringify(err)).graphQLErrors[0].gerrType
          if (errors === 'InvalidParam') {
            thisDate.$message({
              message: '验证码错误',
              type: 'error'
            })
          }
          console.log(err)
        })
    })
  },
  logOut({ commit, state }) {
    return new Promise((resolve) => {
        commit('setToken', '')
        resolve()
    })
  },
  /**
   * @method function 注销session
   */
  fedLogOut({ commit }) {
    return new Promise(resolve => {
      commit('setToken', '')
      console.log('fedLogOut')
      resolve()
    })
  },
  /**
   *
   * @method func 获取左菜单栏
   * @param {Object} pthis 父级this
   */
  getLeftmenu({ commit, state }, pthis) {
    return new Promise(resolve => {
      pthis.$apolloProvider.clients.menu
        .query({
          query: M.menuByMe,
          variables: {
            token: state.token,
            companyNo: pthis.defCompanyNo
          }
        })
        .then((res: any) => {
          const menu = res.data.menuByMe
          commit('setLeftMenu', menu)
          resolve()
        })
        .catch((err: any) => {
          // 如果用户未授权任何菜单选项自动退出
          console.log('GG--simida')
          const empty: [] = []
          commit('setLeftMenu', empty)
          resolve()
          throw new Error(err)
        })
    })
  }
}
export default actions
