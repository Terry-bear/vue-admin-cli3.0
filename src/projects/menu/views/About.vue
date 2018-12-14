<template>
  <div class="about">
    <h1>This is an about page</h1>
    <h3 v-html="getVal"></h3>
    <el-button @click="testWatch" type="primary" round>主要按钮</el-button>
    <p>------------------------------------------</p>
    <h5>测试过滤器在vue中的使用</h5>
    <span>这个消息是转化之前的</span>
    <span>这个消息是转化之后的: {{100 | hahaf}}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
Vue.filter('hahaf', function(arg: any) {
  console.log('haha', arg)
  return 'haha'
})
@Component({})
export default class About extends Vue {
  private name: string = '哈哈'
  private eventVal: string = '我是初始值'
  private testWatch() {
    console.log('这是个监听watch的按钮')
    this.eventVal = '我是修改了的值'
  }
  @Watch('eventVal')
  private watchEVal(e: string) {
    console.log('我监听到了eventVal->', e)
  }
  public get getVal(): string {
    return '--------ts--->' + this.name
  }
}
</script>
