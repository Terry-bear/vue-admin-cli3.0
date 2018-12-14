<template>
  <div>
    <back-btn :cancle="backToNoti"></back-btn>
    <div class="box-card-wrapper">
      <el-card class="box-card" style="width:1136px;">
        <div slot="header" class="clearfix">
          <span v-html="currData.title" class="noti-detail-title"></span> &emsp; <el-tag :type="fMessageWeight.value" v-show="currData.messageStauts === 1" size="mini">{{fMessageWeight.label}}</el-tag>
          <p class="noti-detail-date" v-html="fUpdateTime"></p>
        </div>
        <div class="noti-detail-text item">
          {{currData.content}} <span class="simulation-a-btn" v-html="goWhereMsg" @click="goIdxFunc"></span>
        </div>
      </el-card>
    </div>
    <!-- {{currData}} -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue.ts'
import BackBtn from '@/components/BackBtn.vue'
@Component({
  components: {
    BackBtn
  }
})
export default class NotifyDetail extends mixins(ExtVue) {
  @Prop() public createStatus!: boolean
  @Prop() public currData!: any
  public adaptWidth: any
  public goWhereMsg!: string
  public goWhereStutas!: string

  public data() {
    return {
      adaptWidth: null,
      goWhereMsg: '',
      goWhereStutas: ''
    }
  }
  public created() {
    this.toWhereFunc(this.currData.messageType)
  }
  public mounted() {
    this.adaptWidth = `width:${(this as any).getViewportSize().width - 24 * 2}px;`
  }

  public get fMessageWeight(): any {
    const msgObj = { value: '', label: '' }
    switch (this.currData.messageWeight) {
        case '1':
          msgObj.value = ''
          msgObj.label = '一般'
          break
        case '2':
          msgObj.value = 'warning'
          msgObj.label = '重要'
          break
        case '3':
          msgObj.value = 'danger'
          msgObj.label = '紧急'
          break
      }
    return msgObj
  }
  public get fUpdateTime(): any {
      return this.currData.updateTime !== undefined ? this.currData.updateTime.substring(0, this.currData.updateTime.length - 2) : this.currData.updateTime
  }
  @Emit('detailStatus')
  public etDetailStatus() {
    return false
  }
  @Emit('currMsgType')
  public etCurrMsgType() {
    return 'all'
  }
  @Emit('key')
  public etKey() {
    return ''
  }
  @Emit('pageNo')
  public etPageNo() {
    return 1
  }
  public backToNoti() {
    this.etDetailStatus()
    this.etCurrMsgType()
    this.etKey()
    this.etPageNo();
    (this as any).$parent.$apollo.queries.messageByCoBo.refetch()
  }
  public toWhereFunc(type: string) {
    switch (type) {
      case '企业注册-注册审核':
        if (this.$store.state.menu.tokenObj.lesseeKey === '') {
          this.goWhereMsg = '修改企业信息'
          this.goWhereStutas = 'openComInfo'
        } else {
          this.goWhereMsg = '去审核'
          this.goWhereStutas = 'orgCheck'
        }
        break
      case '招工任务-岗位审核':
        this.goWhereMsg =
          this.$store.state.menu.tokenObj.lesseeKey === ''
            ? '修改发布岗位'
            : '去审核'
        this.goWhereStutas = 'offerCheck'
        break
      case '用工任务-岗位分配':
        this.goWhereMsg = '去分配'
        this.goWhereStutas = 'taskIdx'
        break
    }
  }
  public goIdxFunc() {
    switch (this.goWhereStutas) {
      case 'orgCheck':
        window.localStorage.setItem('orgCheck', 'orgCheck')
        break
      case 'offerCheck':
        window.localStorage.setItem('offerCheck', 'offerCheck')
        break
      case 'taskIdx':
        window.localStorage.setItem('taskIdx', 'taskIdx')
        break
      case 'openComInfo':
        window.localStorage.setItem('openComInfo', 'openComInfo')
        break
    }
  }
}
</script>

<style scoped>
.noti-detail-title {
  font-size: 16px;
  font-weight: bold;
}
.noti-detail-date {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
}
.noti-detail-text {
  color: rgba(0, 0, 0, 0.65);
}
.box-card-wrapper {
  display: flex;
  justify-content: center;
}
.simulation-a-btn {
  color: #1a91ff;
  cursor: pointer;
}
.simulation-a-btn:hover {
  background-color: rgb(245, 245, 245);
  color: #409eff;
  text-decoration: underline;
}
</style>
