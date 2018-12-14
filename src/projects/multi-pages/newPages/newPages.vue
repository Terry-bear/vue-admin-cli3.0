<template>
  <div class="new_box" id="apps">
    <div class="new_head">
      <div class="flex grow">
        <div class="new_logo">
          <img :src="logo" alt="">
        </div>
      </div>
      <div class="flex grow direction bg3">
        <a href="#1" class="btn">首页</a>
        <a href="#2" class="btn">app介绍</a>
        <a href="#3" class="btn">功能亮点</a>
        <!--<button class="button">优先体验</button>-->
      </div>
    </div>
    <div class="new_step bg1" id="1">
      <div class="new_body">
        <div style="width: 35%">
          <p class="p1">劳动力服务平台</p>
          <p class="p2">助力脱贫攻坚的最后一公里</p>
          <div id="er">
            <qrcode :value="application" size="184" level="H"></qrcode>
          </div>
          <button class="andr">
            <img :src="er" alt="">
            <span>Android版下载</span>
          </button>
        </div>
        <div style="width: 46%;margin-left: 2%">
          <img :src="index" alt="">
        </div>
      </div>
    </div>
    <div class="new_step bg2 padding" id="2">
      <div class="new_body1">
        <div class="color"></div>
        <p class="p3">什么是劳动力服务平台</p>
        <div class="flex height">
          <div class="img">
            <img :src="img2" alt="">
          </div>
          <div class="text">
            <p class="p3" style="text-align: left">劳动力服务平台</p>
            <p class="p4">是一个助力平台，以促进劳动力就业为突破口，逐渐形成 ，劳动力培训，劳动力就业的生态闭环。从而建立劳务协作机制，提高有组织输出程度，促进贫困劳动力输出就业和稳定就业。</p>
            <div class="color" style="margin: 15px 0"></div>
          </div>
        </div>

      </div>
    </div>
    <div class="new_step" id="3">
      <div class="new_body1">
        <div class="color"></div>
        <p class="p3">产品亮点功能</p>
        <div style="height: calc(100% - 58px)">
          <div class="new_item" v-for="(item, index) in items" :key="index">
            <img :src="item.img" alt="">
            <p>{{item.text}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="step1">
      <p class="p3" style="text-align: left">联系我们</p>
      <div class="confor">
        <p>Github:<a href="https://github.com/t496971418"></a></p>
        <p>Mail:496971418@qq.com</p>
      </div>
      <div style="display: inline-block;vertical-align: middle;width: 70px;height: 70px">
        <img :src="com" height="100%" alt="">
      </div>
    </div>
    <div class="foot">
      <p>Copyright © 2017 UI by SJ</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch, Prop, Model, Provide, Inject } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'
import logo from '@/projects/multi-pages/assets/newPages/img/logo.png'
import index from '@/projects/multi-pages/assets/newPages/img/pic_1.png'
import er from '@/projects/multi-pages/assets/newPages/img/icon_Android.png'
import img2 from '@/projects/multi-pages/assets/newPages/img/pic_2.png'
import imgs1 from '@/projects/multi-pages/assets/newPages/img/pic_3.png'
import imgs2 from '@/projects/multi-pages/assets/newPages/img/pic_4.png'
import imgs3 from '@/projects/multi-pages/assets/newPages/img/pic_5.png'
import imgs4 from '@/projects/multi-pages/assets/newPages/img/pic_6.png'
import imgs5 from '@/projects/multi-pages/assets/newPages/img/pic_7.png'
import imgs6 from '@/projects/multi-pages/assets/newPages/img/pic_8.png'
import com from '@/projects/multi-pages/assets/newPages/img/img.png'
import * as d from './api/device.gql'
import qrcode from 'qrcode.vue'
@Component({
  components: {
    qrcode
  }
})
export default class NewPages extends Vue {
  @State('leftWith') public stateLeftWith: any
  private logo: any
  private index: any
  private er: any
  private img2: any
  private com: any
  private application: string = ''
  public data() {
    return {
      name: 'index',
      logo,
      index,
      er,
      img2,
      application: '',
      com,
      items: [
        {
          img: imgs1,
          text: '海量劳动力基本数据'
        },
        {
          img: imgs2,
          text: '岗位和劳动力精准匹配'
        },
        {
          img: imgs3,
          text: '实时查看岗位申请情况'
        },
        {
          img: imgs4,
          text: '培训意愿数据采集'
        },
        {
          img: imgs5,
          text: '就业意愿数据采集'
        },
        {
          img: imgs6,
          text: '劳动力信息错误反馈'
        }
      ]
    }
  }
  public mounted() {
    console.log(this.stateLeftWith)
    this._getApp()
  }

   private async _getApp() {
     try {
        const { data } = await (this as any).$apolloProvider.clients.device.query({
          query: d.deviceNameByCoBo,
          variables: {
            token: (this as any).$store.state.menu.token
          }
        })
        const date = JSON.parse(JSON.stringify(data))
        console.log(date)
        this.application = date.deviceNameByCoBo.filter((item: any) => {
          if (item.deviceName === '执行人app') {
            console.log(item.deviceVersion.downUrl)
            return item.deviceVersion.downUrl
          }
        })
      } catch (err) {
        this.application = ''
      }
    }
}
</script>

<style src="./style.scss" lang="scss">
</style>
