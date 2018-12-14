<template>
  <div style="background: #42485b;">
    <el-row style="text-align: center;background: #333744;color: #ffffff; height: 48px; padding-top: 12px;">
      <div @click="toggle">
        <svg-icon :class="[isCollapse? 'menu-btn90' : 'menu-btn']" :icon-class="[isCollapse? 'menu-btn90' : 'menu-btn']"></svg-icon>
      </div>
      <div>
        <div @click="goIndex" style="width: 80px; height: 50px;margin-left: 60px;cursor: pointer;">
          <svg-icon v-if="!isCollapse" style="height:50px;width:80px;margin-left: 25px;margin-top: -12px;transition: width 1s;" icon-class="rh-name"></svg-icon>
        </div>
      </div>
    </el-row>
    <el-row>
      <el-menu :default-active="currentMenuIndex" :collapse="isCollapse" style="height: 100%;margin-bottom: -99999px;padding-bottom: 99999px;" mode="vertical" unique-opened background-color="#343743" text-color="#fff" active-text-color="#fff">
        <sidebar-item :menu="leftMenu"></sidebar-item>
      </el-menu>
    </el-row>
  </div>
</template>

<script lang="ts">
import '../../assets/scss/sidebar.scss'
import InvertByBase from '@/utils/InvertByBase64'
import SidebarItem from '@/components/SidebarItem.vue'
import ExtVue from 'mixin/ExtVue.ts'
import { mixins } from 'vue-class-component'
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'
@Component({
  components: { SidebarItem }
})
export default class Side extends mixins(ExtVue) {
  private get isCollapse() {
    return this.getCommonData.isCollapse
  }
  private get currentMenuIndex() {
    return this.getCommonData.currentMenuIndex
  }
  private get leftMenu() {
    return this.getMenuData.leftMenu
  }
  private get tokenObj() {
    return this.getMenuData.tokenObj
  }
  // *'isCollapse', 'currentMenuIndex', 'leftMenu', 'tokenObj'
  @Getter('syncMenuData') public getMenuData: any
  @Getter('syncCommonData') public getCommonData: any
  @Mutation('toggle') public toggle: any
  @Mutation('setMainContentUrl') public setMainContentUrl: any
  @Mutation('setCurrentMenuIndex') public setCurrentMenuIndex: any
  @Mutation('setDecodeToken') public setDecodeToken: any
  @Action('getLeftmenu') public getLeftmenu: any
  private status: any
  private defCompanyNo: any
  public data() {
    return {
      status: '',
      defCompanyNo: ''
    }
  }
  public async created() {
    const token = await new InvertByBase(this.$store.state.menu.token)
    this.setDecodeToken(token.regInfo())
    const defCompanyNoArr = token.authorObjToArr(this.getMenuData.tokenObj.def)
    this.defCompanyNo = defCompanyNoArr[0]
    await this.getLeftmenu(this)
    if (this.getMenuData.leftMenu.length > 0) {
      if (window.localStorage.getItem('FirstLoginIndex') === null) {
        const indexUrl = this.setFirstLoginIndex(this.getMenuData.leftMenu)
        this.setCurrentMenuIndex(indexUrl)
      } else {
        this.setCurrentMenuIndex(this.getCommonData.currentMenuIndex)
      }
    }
  }
  public mounted() {
    if (this.getCommonData.isCollapse) { this.status = '' } else { this.status = 'status' }
    this.eventListenerBychild('preset_menu_7_1')
    console.log('this.$store.state.menu.token:', this.$store.state.menu.token)
  }
  public handleOpen(key: any, keyPath: any) {
    // console.log(key, keyPath)
  }
  public handleClose(key: any, keyPath: any) {
    console.log(key, keyPath)
  }
  public goIndex() {
      this.setMainContentUrl('/index')
  }
  /**
   * 利用H5的Storage来监听content状态变化引起的菜单变化
   * @param {String} toCurrIdx 想要跳转的页面的idx
   * 目前只支持岗位跳转到任务列表
   */
  public eventListenerBychild(toCurrIdx: any) {
    const _this = this
    window.addEventListener('storage', function(e) {
      if (e.newValue === 'toTask') {
        const uri = window.localStorage.getItem('offerInfo')
        _this.setMainContentUrl('/taskList?' + uri)
        // debugger
        _this.setCurrentMenuIndex(toCurrIdx)
        localStorage.removeItem('toTask')
        localStorage.removeItem('offerInfo')
      }
    })
  }
  /**
   * 设置第一次登陆菜单栏展开首选项
   * @param {Array} localArr 存入的localStorage
   */
  private setFirstLoginIndex(localArr: any): any {
    if (localArr[0].children === undefined || localArr[0].children.length === 0) {
      window.localStorage.setItem('FirstLoginIndex', 'FirstLoginIndex')
      return localArr[0].index
    } else {
      return this.setFirstLoginIndex(localArr[0].children)
    }
  }
}
</script>

<style lang="scss" scoped>
.status {
  position: absolute;
  left: 20px;
  top: 15px;
}
.menu-btn {
  height: 24px;
  width: 24px;
  position: absolute;
  top: 10px;
  left: 20px;
  cursor: pointer;
}
.menu-btn90 {
  height: 24px;
  width: 24px;
  position: absolute;
  top: 10px;
  left: 10px;
  cursor: pointer;
}
</style>
