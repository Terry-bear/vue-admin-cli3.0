<template>
  <div class="login-container pull-height" @keyup.enter.native="handleLogin">
    <div class="login-info text-white animated fadeInLeft">
      <h2 style="margin: 0;font-size: 30px;color: #ffffff">{{lesseeInfo.systemName === null ? '人和数据' : lesseeInfo.systemName}}</h2>
      <h2 class="login-info-title" style="margin-bottom: 30px">{{lesseeInfo.lesseeTitle === null ? '人和方可致远，数据唤醒希望' : lesseeInfo.lesseeTitle}}</h2>
      <ul class="login-info-list" v-if="!lesseeInfo.systemName">
        <li class="login-info-item"> 动态实名制管理</li>
        <li class="login-info-item"> 社保卡制卡数据在线服务</li>
        <li class="login-info-item"> 医疗实名自助服务</li>
        <li class="login-info-item"> 劳动力就业服务</li>
      </ul>
      <div v-else v-html="lesseeInfo.lesseeFeedback" style="color: #fff; width: 350px;"></div>
      <canvas id="mycvs"></canvas>
    </div>
    <div class="login-border pull-height">
      <div class="login-main animated fadeIn">
        <!-- <svg-icon style="height:90px;width:180px;" icon-class="rhcompany-logo"></svg-icon> -->
        <div class="title-wrapper">
          <div>
            <h2>登录(开发)</h2>
            <p>{{lesseeInfo.systemName === null ? '人和数据' : lesseeInfo.systemName}}</p>
          </div>
          <svg-icon style="height:80px;width:80px;" icon-class="index-logo" v-if="!lesseeInfo.lesseeLogoUrl"></svg-icon>
          <img style="height:80px;width:80px;" :src="lesseeInfo.lesseeLogoUrl" v-else>
        </div>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="用户密码" name="user">
            <userLogin></userLogin>
          </el-tab-pane>
          <el-tab-pane label="短信验证码" name="code">
            <codeLogin></codeLogin>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Mutation } from 'vuex-class'
import * as O from '@/projects/menu/graphql/org.gql'
import { Component, Vue, Prop } from 'vue-property-decorator'
import userLogin from './userlogin.vue'
import codeLogin from './codelogin.vue'

interface LesseeInfo {
  lesseeFeedback: string | null
  lesseeId: string | null
  lesseeLogoUrl: string | null
  lesseeNo: string | null
  lesseeStatus: string | null
  lesseeTitle: string | null
  lesseeType: string | null
  loginUrl: string | null
  principalMobile: string | null
  principalPart: string | null
  principalPerson: string | null
  systemName: string | null
}
@Component({
  components: {
    userLogin,
    codeLogin
  },
  apollo: {
    $client: 'org',
    $loadingKey: 'loading',
    lesseeByLeUrl() {
      const urlArr: any = window.location.href.match(/^http\w{0,1}:\/\/(.+)\//)
      if (urlArr[1]) {
        this.loginUrl = urlArr[1]
      }
      return {
        query: O.lesseeByLeUrl,
        variables() {
          return {
            loginUrl: urlArr[1]
          }
        },
        // manual: true,
        // Polling
        // pollInterval: 3000, // ms
        result({ data, loading }) {
          // this.updateCount ++
          if (!loading) {
            if (data.lesseeByLeUrl !== undefined) {
              // console.log('lesseeInfo', data.lesseeByLeUrl)
              this.lesseeInfo = data.lesseeByLeUrl
              this.setLesseeInfo(data.lesseeByLeUrl)
            }
          }
        },
        error(error) {
          console.log('---------', JSON.parse(JSON.stringify(error)).graphQLErrors[0].gerrType)
          // if (JSON.parse(JSON.stringify(error)).graphQLErrors[0].gerrType === '') {
          // } else {
          // }
        },
        fetchPolicy: 'network-only'
      }
    }
  }
})
export default class Index extends Vue {
  @Mutation('setLesseeInfo') private setLesseeInfo: any
  private name: string  = 'login'
  private dotsNum: number = 45
  private isColor: boolean = true
  private roundColor: string = '#999'
  private lineColor: string = '#ccc'
  private lesseeInfo!: LesseeInfo
  public data() {
    return {
      activeName: 'user',
      lesseeInfo: this.lesseeInfo
    }
  }
  public created() {
    const canvas: any = document.getElementById('mycvs')
    const ctx = canvas.getContext('2d')
    const rndCl = () => Math.floor(Math.random() * 225)
    const width = window.innerWidth
    const height = window.innerHeight
    let baseList: any[] = []
    canvas.width = width
    canvas.height = height

    // 绘制园
    const drawRounds = (obj: any, index: any) => {
      const { x, y, r, color } = obj
      ctx.beginPath()
      ctx.arc(x, y, r, 0, 2 * Math.PI)
      if (this.isColor) {
        ctx.fillStyle = color
      } else {
        ctx.fillStyle = this.roundColor
      }
      ctx.fill()
      ctx.closePath()
    }

    // 判断移动方向
    const controlDirection = (obj: any) => {
      if (obj.x >= (width - obj.r)) {
        obj.controlX = 'left'
      } else if (obj.x <= parseInt(obj.r, undefined) / 2) {
        obj.controlX = 'right'
      }

      if (obj.y >= (height - obj.r)) {
        obj.controlY = 'bottom'
      } else if (obj.y <= parseInt(obj.r, undefined) / 2) {
        obj.controlY = 'top'
      }
      return obj
    }

    // 划线
    const drawLine = (list: any) => {
      list.map((item: any, index: any) => {
        // console.log('item:', item)
        ctx.beginPath()
        ctx.moveTo(item.x1, item.y1)
        ctx.lineTo(item.x2, item.y2)
        ctx.LineWeight = 1
        if (this.isColor) {
          ctx.strokeStyle = item.color
        } else {
          ctx.strokeStyle = this.lineColor
        }
        ctx.stroke()
        ctx.closePath()
      })
    }

    // 绘制
    const draw = (list: any) => {
      const dotsArr: any[] = []
      const lineArr: any[] = []

      list.map((item: any, index: any) => {
        const xy = controlDirection(item)
        const obj = roundMove(xy)
        dotsArr.push(obj)
      })
      dotsArr.map((item1, index1) => {
        dotsArr.map((item2, index2) => {
          if (item1 !== item2) {
            const x = item1.x - item2.x
            const y = item1.y - item2.y
            if (Math.abs(x) < 150 && Math.abs(y) < 150) {
              const obj = {
                x1: item1.x,
                y1: item1.y,
                x2: item2.x,
                y2: item2.y,
                color: item1.color
              }
              lineArr.push(obj)
            }
          }
        })
      })
      drawLine(lineArr)

      dotsArr.map((item, index) => {
        drawRounds(item, index)
      })

      baseList = dotsArr

      setTimeout(() => {
        // if(this.paused){
        reDraw()
        // }
      }, 50)
    }

    const reDraw = () => {
      ctx.clearRect(0, 0, width, height)
      draw(baseList)
    }

    // 移动
    const roundMove = (obj: any) => {
      switch (obj.controlX) {
        case 'right':
          obj.x++
          break
        case 'left':
          obj.x--
          break
        default:
      }
      switch (obj.controlY) {
        case 'top':
          obj.y++
          break
        case 'bottom':
          obj.y--
          break
        default:
      }
      return obj
    }

    // 创造圆点
    const creatDots = () => {
      const arr: any[] = []
      for (let i = 0; i < this.dotsNum; i++) {
        const obj: any = {}
        obj.x = parseInt(Math.random() * width + '', undefined)
        obj.y = parseInt(Math.random() * height + '', undefined)
        obj.r = parseInt(Math.random() * 10 + '', undefined)
        obj.controlX = parseInt(Math.random() * 10 + '', undefined) > 5 ? 'left' : 'right'
        obj.controlY = parseInt(Math.random() * 10 + '', undefined) > 5 ? 'bottom' : 'top'

        obj.color = `rgba(${rndCl()},${rndCl()},${rndCl()},.3)`

        arr.push(obj)
      }
      return arr
    }
    draw(creatDots())
  }
  private handleClick() {
    console.log()
  }
}
</script>

<style lang="scss">
.login-container {
  display: flex;
  height: 100%;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.6);
  position: relative;
}
.login-container::before {
  z-index: -999;
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background-image: url("../../assets/img/login.jpg");
  background-size: cover;
}
.login-info {
  padding-left: 60px;
}
.login-info-title {
  margin: 0;
  line-height: 40px;
  font-size: 20px;
  color: #fff;
}
.login-info-item {
  font-size: 14px;
  color: #fff;
}
.login-border {
  display: flex;
  align-items: center;
  background-color: #fff;
  height: 100%;
  z-index: 9;
}
.login-main {
  padding: 140px 60px;
  width: 450px;
  border-radius: 3px;
  box-sizing: border-box;
  background-color: #fff;
  & > .el-tabs {
    margin-top: 30px;
    z-index: 9;
  }
}
.login-main > h3 {
  margin-bottom: 20px;
}
.login-main > p {
  color: #76838f;
}
.login-submit {
  width: 100%;
}
.login-form {
  margin: 20px 0;
}
.login-code {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 0 10px;
}
.login-code-img {
  width: 100px;
  height: 43px;
  background-color: #eee;
  border: 1px solid #f0f0f0;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 2px;
  text-indent: 2px;
  text-align: center;
}
.title-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  z-index: 9;
}
#mycvs {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 80%;
}
</style>
