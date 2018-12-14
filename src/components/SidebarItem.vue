<template>
  <div class="menu-wrapper">
    <template v-for="item in menu">
      <el-menu-item v-if="!item.children || item.children.length===0 " :class="{'submenu-title-noDropdown':!isNext}" :index="item.index" @click="open(item)" :key="item.label">
        <i :class="item.icon"></i>
        <svg-icon :icon-class="item.icon" style="width:15px;height:15px;"></svg-icon>
        <span slot="title">{{item.label}}</span>
      </el-menu-item>
      <el-submenu v-else :index="item.index" :key="item.label">
        <template slot="title">
          <svg-icon :icon-class="item.icon" style="width:15px;height:15px;"></svg-icon>
          <span slot="title" :class="{display:!show}">{{item.label}}</span>
        </template>
        <template v-for="child in item.children">
          <el-menu-item v-if="!child.children || child.children.length==0" :index="child.index" @click="open(child)" :key="child.index">
            <svg-icon :icon-class="child.icon" style="width:15px;height:15px;"></svg-icon>
            <span slot="title">{{child.label}}</span>
          </el-menu-item>
          <sidebar-item :isNext="true" class="next-menu" v-else :menu="[child]" :show="show" :key="child.index"></sidebar-item>
        </template>
      </el-submenu>
    </template>
  </div>
</template>
<script lang="ts">
import { Mutation, State, Getter, Action } from 'vuex-class'
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { mapGetters, mapMutations } from 'vuex'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
@Component({})
export default class SidebarItem extends Vue {
  private get currentMenuIndex() {
    return this.getCommonData.currentMenuIndex
  }
  private get mainContentUrl() {
    return this.getCommonData.mainContentUrl
  }
  private name: string = 'SidebarItem'
  private $message: any
  @Prop() private menu!: any[]
  @Prop({ default: true }) private show!: boolean
  @Prop({ default: false }) private isNext!: boolean
  @Getter('syncCommonData') private getCommonData: any
  @Mutation('setCurrentMenuIndex') private setCurrentMenuIndex: any
  @Mutation('setMainContentUrl') private setMainContentUrl: any
  public data() {
    return {}
  }
  public created() {
    NProgress.configure({ showSpinner: false })
  }
  public open(item: any) {
    // console.log(`open:${item.href}`)
    this.load()
    this.setCurrentMenuIndex(item.index)
    console.log('item.href=' + item.href)
    this.setMainContentUrl(item.href)
  }
  public getMenuIndexUrl(items: any, menuIndex: any) {
    for (const item of items) {
      if (item.index === menuIndex) {
        return item.href
      } else if (item.children && item.children.length > 0) {
        const rtUrl: any = this.getMenuIndexUrl(item.children, menuIndex)
        if (rtUrl !== false) {
          return rtUrl
        }
      }
    }
    return false
  }
  // 加载组件
  public load() {
    NProgress.start()
    // 超时3s自动隐藏等待狂，加强用户体验
    let time = 5
    const timeFunc = setInterval(() => {
      time--
      if (time === 0) {
        NProgress.done()
      }
    }, 1000)
  }
  @Watch('menu')
  private watchMenu() {
    // console.log('监控menu的值-->', this.menu)
      setTimeout(() => {
        if (this.menu.length === 0 || this.menu === null) {
          let time = 5
          console.log('GG-->自动退出')
          const sti = setInterval(() => {
            this.$message({
              message: `您没有任何菜单权限即将在${time}秒后退出`,
              type: 'warning'
            })
            time--
            console.log('time-->', time)
            if (time < 0) {
              clearInterval(sti)
              localStorage.clear()
              sessionStorage.clear()
              location.reload()
            }
          }, 1000)
        }
      }, 2000)
  }
}
</script>
<style scoped>
.el-submenu [class^='el-icon-'],
.el-menu-item [class^='el-icon-'] {
  width: 18px;
}
.fa-lg,
.fa-navicon {
  font-size: 1.1rem !important;
}
</style>
