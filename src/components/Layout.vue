<template>
  <!--
  左侧固定宽，右侧自适应屏幕宽；
  左右两列，等高布局；
  左右两列要求有最小高度，例如：200px;（当内容超出200时，会自动以等高的方式增高）
  要求不用JS或CSS行为实现；
  原文: https://www.w3cplus.com/css/two-cloumn-width-one-fixed-width-one-fluid-width -->
  <div class="app-wrapper" ref="layout" :class="{collapseLeft:layoutLeft && isCollapse}">
    <component v-show="!isFullscreen" class="left-wrapper" :is="layoutLeft" :style="{height: maxHeight + 'px', minHeight: maxHeight + 'px', width: leftWith + 'px' }"></component>
    <component v-show="!isFullscreen" :class="[layoutLeft ? 'all-transition' : '' ]" :is="layoutTop" :style="{marginLeft: leftWith + 'px',height: topHeight + 'px'}"></component>
    <div :class="[layoutLeft ? 'all-transition' : '' ]" class="main-wrapper" ref="main" :style="{marginLeft: leftWith + 'px',height:(maxHeight - (isFullscreen ? 0 : topHeight))+ 'px'}">
      <router-view :style="{height: (maxHeight - (isFullscreen ? 0 : topHeight) - (isFullscreen ? 0 : bottomHeight)) + 'px'}"> </router-view>
      <component v-show="!isFullscreen" :is="layoutBottom" :style="{height: bottomHeight + 'px'}"></component>
    </div>
  </div>
</template>
<style scoped>
.app-wrapper {
  overflow: hidden;
}
.left-wrapper {
  transition: width 0.28s;
  float: left;
  margin-bottom: -99999px;
  padding-bottom: 99999px;
  overflow: hidden;
}

.main-wrapper {
  margin-bottom: -99999px;
  padding-bottom: 99999px;
}

.all-transition {
  transition: margin-left 0.28s;
}
</style>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'

@Component({
  beforeRouteEnter: (to, from, next) => {
    let currentLayoutTop: any
    let currentLayoutTopHeight: any
    let currentLayoutLeft: any
    let currentLayoutBottom: any
    let currentLayoutBottomHeight: any

    // 永远保留最底层的meta数据(Layout不允许嵌套使用)
    to.matched.forEach(record => {
      if (record.meta.layoutTop) {
        currentLayoutTop = record.meta.layoutTop
      }
      if (record.meta.layoutTopHeight) {
        currentLayoutTopHeight = record.meta.layoutTopHeight
      }
      if (record.meta.layoutLeft) {
        currentLayoutLeft = record.meta.layoutLeft
      }
      if (record.meta.layoutBottom) {
        currentLayoutBottom = record.meta.layoutBottom
      }
      if (record.meta.layoutBottomHeight) {
        currentLayoutBottomHeight = record.meta.layoutBottomHeight
      }
    })
    next((vm: any) => {
      // 通过 `vm` 访问组件实例
      vm.setLayout(currentLayoutTop, currentLayoutBottom, currentLayoutLeft, currentLayoutTopHeight, currentLayoutBottomHeight)
    })
  }
})
export default class Layout extends Vue {
  private name: string = 'Layout'
  private maxHeight: string | number = 500
  private layoutTop: number = 0
  private layoutBottom: number = 0
  private layoutLeft: number = 0
  private topHeight: number = 0
  private bottomHeight: number = 0
  @Getter('syncCommonData') private getCommonData: any
  @Mutation('setLeftWith') private setLeftWith: any
  public data() {
    return {
      layoutTop: this.layoutTop,
      layoutLeft: this.layoutLeft,
      layoutBottom: this.layoutBottom,
      topHeight: this.topHeight, // 顶部高度
      bottomHeight: this.bottomHeight, // 底部高度
      maxHeight: this.maxHeight // 默认
    }
  }

  public get isCollapse() {
    return this.getCommonData.isCollapse
  }
  public get leftWith() {
    return this.getCommonData.leftWith
  }
  public get isFullscreen() {
    return this.getCommonData.isFullscreen
  }
  private mounted() {
    this.maxHeight = `${(document as any).documentElement.clientHeight}`
    // 然后监听window的resize事件．在浏览器窗口变化时再设置下背景图高度．
    const that = this
    window.onresize = function() {
      that.maxHeight = `${(document as any).documentElement.clientHeight}`
    }
    console.log('mounted')
  }
  private setLayout(layoutTop: number, layoutBottom: number, layoutLeft: number, layoutTopHeight: number, layoutBottomHeight: number) {
    this.layoutTop = layoutTop
    this.layoutBottom = layoutBottom
    // 没有左边，则隐藏左侧，右侧左边距为0
    if (layoutLeft) {
      this.layoutLeft = layoutLeft
    } else {
      this.setLeftWith(0)
    }
    if (layoutTopHeight) {
      this.topHeight = layoutTopHeight
    } else if (!layoutTop) {
      this.topHeight = 0
    } else {
      this.topHeight = 20
    }
    if (layoutBottomHeight) {
      this.bottomHeight = layoutBottomHeight
    } else if (!layoutBottom) {
      this.bottomHeight = 0
    } else {
      this.bottomHeight = 30
    }
  }
}
</script>
