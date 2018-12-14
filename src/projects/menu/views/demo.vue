<template>
  <div></div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop, Model, Provide, Inject } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'
import router from '@/projects/router.ts'
@Component({
  beforeRouteEnter: (to, from, next) => {
    let currentLayoutTop: any
    let currentLayoutTopHeight: any
    let currentLayoutLeft: any
    let currentLayoutBottom: any
    let currentLayoutBottomHeight: any

    console.log('to', to)
    console.log('from', from)
    console.log('next', next)
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
export default class  extends Vue {
  @Mutation('setLeftWith') private setLeftWith: any
  private layoutTop: any
  private layoutBottom: any
  private layoutLeft: any
  private topHeight: any
  private bottomHeight: any
  public setLayout(layoutTop: any, layoutBottom: any, layoutLeft: any, layoutTopHeight: any, layoutBottomHeight: any) {
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
  private created() {
   console.log('created')
  }
  private mounted() {
    console.log('mounted')
  }
}
</script>

<style lang="scss" scoped>
</style>
