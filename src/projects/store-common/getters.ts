import { GetterTree } from 'vuex'

const getters: GetterTree<any, any> = {
  syncCommonData(state) {
    const { leftWith, isCollapse, mainContentUrl, currentMenuIndex, isFullscreen } = state
    console.log('syncCommonData: ', state)
    return {
      leftWith,
      isCollapse: leftWith !== 256,
      mainContentUrl,
      currentMenuIndex,
      isFullscreen
    }
  }
}

export default getters
