import { GetterTree } from 'vuex'

const getters: GetterTree<any, any> = {
  syncMenuData(state) {
    const { token, leftMenu, userId, userInfo, orgInfo, tokenObj } = state
    console.log('-----syncMenuData---', state)
    return {
      token,
      leftMenu,
      userId,
      userInfo,
      orgInfo,
      tokenObj
    }
  }
}

export default getters
