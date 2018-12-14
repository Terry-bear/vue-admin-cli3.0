<template>
  <iframe :src="mainContentUrl" class="iframe" ref="iframe"></iframe>
</template>
<style lang="scss">
.iframe {
  width: 100%;
  height: 100%;
  border: 0;
  overflow: hidden;
  box-sizing: border-box;
}
</style>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'
import { mapGetters } from 'vuex'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
@Component({})
export default class MainContent extends Vue {
  @State('menu') public stateMenu: any
  @Getter('syncCommonData') public getCommonData: any
  public get mainContentUrl(): string {
    return this.getCommonData.mainContentUrl
  }
  public created() {
    NProgress.configure({ showSpinner: false })
  }
  public mounted() {
    this.load()
    this.resize()
  }
  // !H5跨域传值
  public postMsg() {
    let tempSTI = 0
    if (/.+dev-medical\.gshbzw\.com.+/.test(this.mainContentUrl)) {
      const stiVal = setInterval(() => {
        tempSTI++
        (this as any).$refs.iframe.contentWindow.postMessage({
          token: this.stateMenu.token
        }, '*')
        if (tempSTI > 3) {
          clearInterval(stiVal)
        }
      }, 1000)
    }
  }

  // 显示等待框
  public show() {
    NProgress.start()
  }
  // 隐藏等待狂
  public hide() {
    NProgress.done()
  }
  // 加载浏览器窗口变化自适应
  public resize() {
    window.onresize = () => {
      this.iframeInit()
    }
  }
  // 加载组件
  public load() {
    this.show()
    // 超时3s自动隐藏等待狂，加强用户体验
    let time = 5
    const timeFunc = setInterval(() => {
      time--
      if (time === 0) {
        this.hide()
        clearInterval(timeFunc)
      }
    }, 1000)
    this.iframeInit()
  }
  // iframe窗口初始化
  public iframeInit() {
    const iframe: any = this.$refs.iframe
    if (iframe) {
      // 已经在父级，计算了高度
      // const clientHeight = document.documentElement.clientHeight - 120
      // if (iframe.style) {
      //   iframe.style.height = `${clientHeight}px`
      // }
      if (iframe.attachEvent) {
        iframe.attachEvent('onload', () => {
          this.hide()
        })
      } else {
        iframe.onload = () => {
          this.hide()
        }
      }
    }
  }
  @Watch('mainContentUrl')
  private wMainContentUrl() {
    this.postMsg()
  }
}
</script>
