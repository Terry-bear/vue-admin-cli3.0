<template>
  <div class="z-wrapper">
    <div class="maintain-wrapper">
      <div class="header">
        <div class="info">
          <div style="width: 73px;height: 73px;">
            <img v-if="userInfo.headpic" :src="userInfo.headpic" alt="头像" height="100%" width="100%" style="border-radius: 50%">
            <svg-icon v-else icon-class="users" style="width: 73px;height: 73px;border-radius: 50%"></svg-icon>
          </div>
          <div class="text">
            <p>{{userInfo.userName}},您好！</p>
            <p>欢迎登陆 <span>{{lesseeInfo.systemName === null ? '人和数据' : lesseeInfo.systemName}}</span></p>
          </div>
        </div>
        <div class="clock">
          <span class="date">{{ date }}</span>
          <span class="time">{{ time }}</span>
        </div>
      </div>
      <div class="left-content">
        <div class="container-1">
          <div class="container-1--1">
            {{lesseeInfo.lesseeFeedback === null ? msgO : lesseeInfo.lesseeFeedback}}
          </div>
        </div>
      </div>
      <div class="right-content">
        <img :src="imgUrl">
      </div>
      <canvas id="c"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'
import { mapGetters } from 'vuex'
import url from '@/projects/menu/assets/indexPic.png'

interface LesseeInfo {
  systemName: string | null
  lesseeFeedback: string | null
}
@Component({})
export default class Index extends Vue {
  @Getter('syncMenuData') public getMenuData: any
  private lesseeInfo!: LesseeInfo
  private time: any
  private date: any
  private week: any
  public data() {
    return {
      msgO: '平台构建专业的民生数据采集、数据整理、数据分析及数据应用科技创新服务平台，为企业和政府提供全面便捷的人社、医疗、劳务、住建等实名制的数据管理分析展示服务',
      msgT: '数据分析及数据应用的科技创新服务平台,目前,公司形成了以服务为中心的技术研发、产品研发、数据服务的整体解决方案,为社保、卫计、劳动监察等部门提供免费的数据服务及业务应用。',
      imgUrl: url,
      time: '',
      date: '',
      week: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      lesseeInfo: {
        systemName: null,
        lesseeFeedback: null
      }
    }
  }

  public get userInfo(): any {
    return this.getMenuData.userInfo
  }
  public created() {
    const tmp = window.localStorage.getItem('lesseeInfo')
    this.lesseeInfo = typeof tmp === 'string'
      ? JSON.parse(tmp).content
      : {
        systemName: null,
        lesseeFeedback: null
      }
  }
  public mounted() {
    setInterval(() => {
      this.updateTime()
    }, 1000)
    this.animateShow()
  }
    public updateTime() {
      const cd = new Date()
      this.time = this.zeroPadding(cd.getHours(), 2) + ':' + this.zeroPadding(cd.getMinutes(), 2) + ':' + this.zeroPadding(cd.getSeconds(), 2)
      this.date = this.zeroPadding(cd.getFullYear(), 4) + '-' + this.zeroPadding(cd.getMonth() + 1, 2) + '-' + this.zeroPadding(cd.getDate(), 2) + ' ' + this.week[cd.getDay()]
    }
    public zeroPadding(num: any, digit: any) {
      let zero = ''
      for (let i = 0; i < digit; i++) {
        zero += '0'
      }
      return (zero + num).slice(-digit)
    }
    // canvas
    public animateShow() {
      const c: any = document.getElementById('c')
      const ctx = c.getContext('2d')
      const w = c.width = window.innerWidth
      const h = c.height = window.innerHeight
      const cx = w / 2
      const cy = h / 2
      const Box = function(this: any, x: any, y: any, vx: any, color: any) {
        this.color = color
        this.vx = vx
        this.x = x
        this.y = y
        this.w = 10 + Math.random() * 50
        this.h = 5 + Math.random() * 300
      }
      Box.prototype = {
        constructor: Box,
        update() {
          this.x += this.vx
          if (this.x < -this.w / 2) {
            this.x = w + this.w / 2
          }
        },
        render(ctxs: any) {
          ctxs.save()
          ctxs.fillStyle = this.color
          ctxs.translate(this.x, this.y)
          ctxs.fillRect(-this.w / 2, -this.h, this.w, this.h)
          ctxs.restore()
        }
      }

      const ctr = 50
      const boxes: any[] = []
      const boxes2: any[] = []
      const boxes3: any[] = []
      let box
      const speed = -2

      for (let i = 0; i < ctr; i++) {
        box = new (Box as any)(Math.random() * w, h, speed * 0.5, '#e5e5e5')
        boxes.push(box)
      }
      for (let i = 0; i < ctr; i++) {
        box = new (Box as any)(Math.random() * w, h, speed * 0.8, '#cccccc')
        boxes2.push(box)
      }
      for (let i = 0; i < ctr; i++) {
        box = new (Box as any)(Math.random() * w, h, speed, '#999999')
        boxes3.push(box)
      }

      requestAnimationFrame(function loop() {
        requestAnimationFrame(loop)
        ctx.clearRect(0, 0, w, h)
        ctx.globalAlpha = 0.9
        for (let i = 0, len = boxes.length; i < len; i++) {
          box = boxes[i]
          box.update()
          box.render(ctx)
        }
        for (let i = 0, len = boxes2.length; i < len; i++) {
          box = boxes2[i]
          box.update()
          box.render(ctx)
        }
        for (let i = 0, len = boxes3.length; i < len; i++) {
          box = boxes3[i]
          box.update()
          box.render(ctx)
        }
      })
    }
}
</script>

<style lang="scss" scoped>
.maintain-wrapper {
  width: 100%;
  height: 100%;
  background-color: #e9e9e9;
  position: relative;
  /*z-index: 9;*/
  & canvas {
    z-index: 0;
    height: 400px;
    width: 100%;
    margin-top: 30%;
  }
}
.left-content {
  width: 35%;
  height: 45%;
  position: absolute;
  left: 100px;
  top: 150px;
  .container-1--1 {
    width: 100%;
  }
}
.right-content {
  position: absolute;
  left: calc(35% + 100px);
  top: 120px;
  & img {
    height: 400px;
    width: 450px;
  }
}

@-webkit-keyframes typing {
  from {
    width: 0;
  }
}

@keyframes typing {
  from {
    width: 0;
  }
}

@-webkit-keyframes blink-caret {
  50% {
    border-color: #e5e5e5;
  }
}

@keyframes blink-caret {
  50% {
    border-color: #e5e5e5;
  }
}

h1 {
  width: 10em;
  /* fallback */
  /* # of chars */
  white-space: nowrap;
  overflow: hidden;
  -webkit-animation: typing 1s steps(20, end),
    /* # of steps = # of chars */ blink-caret 0.5s step-end infinite alternate;
          animation: typing 1s steps(20, end),
    /* # of steps = # of chars */ blink-caret 0.5s step-end infinite alternate;
}
h3 {
  width: 4em;
  /* fallback */
  /* # of chars */
  white-space: nowrap;
  overflow: hidden;
  -webkit-animation: typing 0.5s steps(10, end),
    /* # of steps = # of chars */ blink-caret 0.5s step-end infinite alternate;
          animation: typing 0.5s steps(10, end),
    /* # of steps = # of chars */ blink-caret 0.5s step-end infinite alternate;
  -webkit-animation-fill-mode: none;
          animation-fill-mode: none;
}
.header{
  position: absolute;
  width: 100%;
  left: 0;
  top: 0;
  height: 100px;
  padding: 20px;
  font-size: 0;
  box-sizing: border-box;
  >div{
    display: inline-block;
    vertical-align: top;
    height: 100%;
    width: 50%;
    font-size: 14px;
  }
}
.info{
  >div{
    display: inline-block;
    vertical-align: top;
  }
}
.text{
  >p{
    margin: 10px;
    font-size: 14px;
    >span{
      font-size: 16px;
      font-weight: bold;
    }
  }
}
.clock{
  text-align: right;
  line-height: 80px;
}
// 时钟
#clock {
  font-family: 'Share Tech Mono', monospace;
  text-align: center;
  position: absolute;
  left: 0;
  top: 0;
  height: 100px;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  color: #1f2d3d;
  text-shadow: 0 0 1px #3c474b, 0 0 5px rgba(10, 175, 230, 0);
}
#clock .time {
  letter-spacing: 0.05em;
  font-size: 24px;
  color: #999999;
  padding: 5px 0;
}
#clock .date {
  letter-spacing: 0.1em;
  color: #999999;
  font-size: 18px;
}
</style>
