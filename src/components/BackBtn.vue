<template>
  <div>
    <div class="back-wrapper" :style="bgImg" @click="backReLevel">
      <span>{{msg}}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
@Component({})
export default class BackBtn extends Vue {
  // ?传入返回的状态值
  @Prop({ default: false }) private backStatus!: boolean
  // ?传入返回的回调函数
  @Prop({ default: () => {} }) private cancle: any
  private data() {
    return {
      msg: '返回上一级',
      bgImg: {
        backgroundImage: 'url(' + require('../projects/menu/assets/img/backIcon.png') + ')'
      }
    }
  }
  private backReLevel() {
    // console.log('backReLevel', typeof this.cancle === 'function')
    if (typeof this.cancle === 'function') {
      this.cancle()
    }
  }
}
</script>

<style lang="scss" scoped>
.back-wrapper {
  -webkit-user-select: none;
  user-select: none;
  background-repeat: no-repeat;
  background-position-x: 10px;
  background-position-y: 10px;
  background-size: 13px 13px;
  background-color: #fff;
  text-align: center;
  line-height: 32px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  width: 116px;
  height: 32px;
  margin: {
    top: 24px;
    bottom: 16px;
    left: 24px;
  }
  &:hover {
    cursor: pointer;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.117647),
      0 1px 4px rgba(0, 0, 0, 0.117647);
    transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  span {
    padding: {
      left: 20px;
    }
  }
}
</style>
