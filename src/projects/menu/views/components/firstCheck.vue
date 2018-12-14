<template>
  <div class="check-c-wrapper">
    <div class="c-container">
      <div class="reject-c-check" v-if="checkStatus === 0">
        <img :src="rejectIcon">
        <div class="c-content-wrapper">
          <p>企业审核被驳回，原因：<color style="color: red;">{{this.$store.state.menu.orgInfo.certifiedFeedback}}</color>
          </p>
          <span style="color: #1890FF; cursor:pointer;" @click="eventHeader">点击修改</span>
        </div>
      </div>
      <div class="first-c-check" v-else-if="checkStatus === -1">
        <img :src="checkIcon">
        <div class="c-content-wrapper">
          <p>企业正在审核中,请等待审核完成之后再进行操作</p>
        </div>
      </div>
      <div class="first-c-check" v-else-if="checkStatus === 1">
        <img :src="forbiddenIcon">
        <div class="c-content-wrapper">
          <p>您的企业已经被停用,请联系管理员</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import forbiddenIcon from '@/projects/menu/assets/c_forbidden_icon.png'
import checkIcon from '@/projects/menu/assets/c_check_icon.png'
import rejectIcon from '@/projects/menu/assets/c_reject_icon.png'

@Component({})
export default class FirstCheck extends Vue {
  private checkStatus: any
  private $store!: any
  private $router!: any
  public data() {
    return {
      checkIcon,
      rejectIcon,
      forbiddenIcon,
      checkStatus: -1
    }
  }
  public mounted() {
    this.checkStatus = this.$store.state.menu.orgInfo.certifiedStatus
    this.verdictCheckStatus()
  }
    public verdictCheckStatus() {
      if (this.$store.state.menu.orgInfo.orgStatus === 1) {
        this.$router.push('/offerList')
      }
    }
    // H5页面监听
    public eventHeader() {
      window.localStorage.setItem('openComInfo', 'openComInfo')
    }
}
</script>

<style lang="scss" scoped>
//宽高
@mixin wh($width, $height) {
  width: $width;
  height: $height;
}
@mixin flexCol {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
@mixin font {
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
}
.check-c-wrapper {
  background-color: #f0f2f5;
  @include wh(100%, 100%);
  @include flexCol;
}
.c-container img {
  @include wh(160px, 160px);
  margin-top: -150px;
}
.c-content-wrapper {
  span,
  p {
    display: block;
    text-align: center;
    @include font;
  }
}
.first-c-check,
.reject-c-check {
  margin: {
    top: 10px;
  }
  background-color: #fff;
  @include wh(1062px, 603px);
  @include flexCol;
}
</style>
