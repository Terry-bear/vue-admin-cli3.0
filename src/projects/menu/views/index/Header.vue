<template>
  <div class="header-wrapper">
    <div class="header-right-wrapper">
      <div class="header-right-box">
        <search-icon></search-icon>
      </div>
      <div class="header-right-line"></div>
      <div class="header-right-box" @click="goNotify" @mouseout="showNoti(false)" @mouseover="showNoti(true)">
        <div v-if="notifyNum !== 0">
          <el-badge :value="notifyNum" style="font-size: 23px;color: #fff;padding-right: 30px;">
            <svg-icon icon-class="notification"></svg-icon>
          </el-badge>
        </div>
        <div v-else>
          <svg-icon icon-class="notification" style="font-size: 23px;color: #fff;"></svg-icon>
        </div>
        <transition name="el-fade-in-linear">
          <div class="notify-entrance-dropdown" v-show="notiInfo">
            <div v-if="notifyData">
              <ul class="notify-entrance-list">
                <li v-for="itm in respnoses" :key="itm.idx">
                  <p @click.stop="notiDetail(itm.messageId)">{{itm.title}}</p>
                  <span>{{itm.dateTime.substring(0, itm.dateTime.length - 2)}}</span>
                </li>
              </ul>
            </div>
            <div class="notify-no-msg" v-else>您暂时没有消息通知</div>
            <div class="notify-more-msg" @click.stop="goNotify">
              <a>更多消息</a>
            </div>
          </div>
        </transition>
      </div>
      <div class="header-right-line"></div>
      <div class="header-right-box">
        <el-tooltip effect="dark" :content="isFullScren?'退出全屏':'全屏'" placement="bottom">
          <span style="font-size: 23px;" @click="handleScreen">
            <svg-icon v-if="isFullScren" icon-class="exitfullscreen"></svg-icon>
            <svg-icon v-else icon-class="fullscreen"></svg-icon>
          </span>
        </el-tooltip>
      </div>
      <div class="header-right-line"></div>
      <div class="header-right-box" @mouseout="showUserInfo(false)" @mousemove="showUserInfo(true)">
        <span class="el-dropdown-link header-item" style="font-size: 38px;">
          <img v-if="userInfo.headpic" :src="userInfo.headpic" alt="个人头像" style="height:35px;width:35px;border:1px solid white;border-radius:50%; position:relative; top:4.5px;" class="user-header">
          <svg-icon v-else icon-class="users" style="width:35px; height:35px;"></svg-icon>
        </span>
        <transition name="el-fade-in-linear">
          <div class="user-entrance-dropdown" v-show="isUserEntranceDropdown">
            <div class="user-entrance-user-info">
              <img v-if="userInfo.headpic" :src="userInfo.headpic" alt="个人头像" style="width: 36px;height: 36px;border-radius: 18px;vertical-align: middle;" class="user-header">
              <svg-icon v-else icon-class="users" style="width: 36px;height: 36px;border-radius: 18px;vertical-align: middle;"></svg-icon>
              <p style="margin: 8px 0;font-size: 12px;line-height: 1.428571429;">
                <span :title="userInfo.name||userInfo.mobileNo||userInfo.userName">{{userInfo.name||userInfo.mobileNo||userInfo.userName}}</span>
              </p>
              <div class="el-dropdown">
                <span @click="isCompanyDropdown=!isCompanyDropdown" class="el-dropdown-link el-dropdown-selfdefine" style="cursor: pointer;">{{defaultCompanyName[0].companyName ? defaultCompanyName[0].companyName : ''}}
                  <i v-show="!validateNull(companyList)" class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <ul v-show="!validateNull(companyList) && isCompanyDropdown" class="el-dropdown-menu" style="width: 252px;margin-top: 19px;position: relative;">
                  <li v-for="item in companyList" :key="item.idx" class="el-dropdown-menu__item" @click="isCompanyDropdown=false">
                    {{ item.companyName }}
                  </li>
                </ul>
              </div>
            </div>
            <ul class="user-entrance-list">
              <li @click="handleDropdown('baseInfo')">
                <svg-icon icon-class="base-info" style="width: 36px;height: 36px;vertical-align: middle;"></svg-icon><br />基本资料
              </li>
              <li @click="handleDropdown('realAuth')">
                <svg-icon icon-class="real-auth" style="width: 36px;height: 36px;vertical-align: middle;"></svg-icon><br />实名认证
              </li>
              <li @click="handleDropdown('safeSet')">
                <svg-icon icon-class="safe-set" style="width: 36px;height: 36px;vertical-align: middle;"></svg-icon><br />安全设置
              </li>
              <li @click="handleDropdown('comInfo')" v-if="this.$store.state.menu.tokenObj.lesseeKey === ''">
                <svg-icon icon-class="com-info" style="width: 36px;height: 36px;vertical-align: middle;"></svg-icon><br />企业资料
              </li>
            </ul>
            <div @click="handleDropdown('logOut')" style="cursor: pointer; height: 50px;text-align: center;line-height: 50px;font-size: 14px;color: #333;background-color: #f5f5f6;">
              <span>退出登陆</span>
            </div>
          </div>
        </transition>
        <base-info class="header-placeholder-class" :isBaseInfoVisible="isBaseInfoVisible" @isBaseInfoVisible="isBaseInfoVisible = $event" v-if="isBaseInfoVisible" />
        <real-auth class="header-placeholder-class" :isRealAuthVisible="isRealAuthVisible" @isRealAuthVisible="isRealAuthVisible = $event" v-if="isRealAuthVisible" />
        <safe-set class="header-placeholder-class" :isSafeSetVisible="isSafeSetVisible" @isSafeSetVisible="isSafeSetVisible = $event" v-if="isSafeSetVisible" />
        <com-info class="header-placeholder-class" :isComInfoVisible="isComInfoVisible" @isComInfoVisible="isComInfoVisible = $event" v-if="isComInfoVisible" />

        <el-dialog title="密码设置" center :visible.sync="isSetPassword" width="600px">
          <el-form v-loading="false" label-position="left" label-width="100px" v-show="true" status-icon :rules="setPasswordRulr" ref="setPasswordForm" :model="setPasswordForm">
            <label>
              <el-form-item prop="userMobileNo" label="手机号">
                <el-input class="user-phone-num" v-model="setPasswordForm.userMobileNo" auto-complete="off" placeholder="请输入新手机号码" :disabled="setPasswordForm.mobileNoStatus"></el-input>
              </el-form-item>
              <el-form-item prop="userVerifyCode" label="验证码">
                <el-input v-model="setPasswordForm.userVerifyCode" auto-complete="off" placeholder="请输入验证码">
                  <template slot="append">
                    <span @click="handleSendNew" class="msg-text" :class="[{display:msgKey}]">{{activeMsgText}}</span>
                  </template>
                </el-input>
              </el-form-item>
            </label>
            <label v-if="true">
              <el-form-item prop="userPassword" label="设置密码">
                <el-input :type="passwordType" v-model="setPasswordForm.userPassword" auto-complete="off" placeholder="请设置密码">
                  <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
                </el-input>
              </el-form-item>
              <el-form-item prop="confirmPassword" label="确认密码">
                <el-input :type="passwordType" v-model="setPasswordForm.confirmPassword" auto-complete="off" placeholder="请再次确认密码">
                  <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
                </el-input>
              </el-form-item>
            </label>
            <el-form-item class="bottomBtn">
              <el-button type="primary" @click.native.prevent="addUserPassword" :disabled="false">确 定</el-button>
            </el-form-item>
          </el-form>
        </el-dialog>
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { Mutation, State, Getter, Action } from 'vuex-class'
import * as a from '@/projects/menu/graphql/auth.gql'
import ExtVue from 'mixin/ExtVue.ts'
import { fullscreenEnable, listenfullscreen, exitFullScreen, reqFullScreen } from '@/utils/dom'
import utils from '@/utils/utils'
import SockJS from 'sockjs-client'
import Stomp from '@stomp/stompjs'
import SearchIcon from '../components/SearchIcon.vue'
import { validateNull, validatorFun, validateMobile, validatePassword } from '@/utils/string'
import BaseInfo from './BaseInfo.vue'
import RealAuth from './RealAuth.vue'
import SafeSet from './SafeSet.vue'
import ComInfo from './ComInfo.vue'

const MSGTIME: number = 120
const MSGINIT: string = '发送验证码'
const MSGERROR: string = '验证码发送失败'
const MSGSCUCCESS: string = '#{time}秒后重发'
let USER_TIMERIN: any
let USER_TIMEROUT: any
let NOTI_TIMERIN: any
let NOTI_TIMEROUT: any
let stompClient: any
@Component({
  components: {
    SearchIcon,
    BaseInfo,
    RealAuth,
    SafeSet,
    ComInfo
  }
})
export default class Header extends mixins(ExtVue) {
  @Getter('syncMenuData') public getMenuData: any
  @Mutation('setIsFullscreen') public setIsFullscreen: any
  @Mutation('setFirstLogin') public setFirstLogin: any
  @Mutation('setMainContentUrl') public setMainContentUrl: any
  @Mutation('setCurrentMenuIndex') public setCurrentMenuIndex: any
  @Action('fetchUserInfo') public fetchUserInfo: any
  @Action('fetchOrgInfo') public fetchOrgInfo: any
  private setPasswordForm!: any
  private respnoses!: any
  private notifyData!: boolean
  private notifyNum!: any
  private notiInfo!: boolean
  private isUserEntranceDropdown!: boolean
  private isFullScren!: boolean
  private companyList!: any
  private defaultCompanyName!: any
  private isSetPassword!: boolean
  private passwordType!: any
  private msgKey!: boolean
  private msgTime!: any
  private activeMsgText!: any

  public data() {
    const validatePass = (rule: any, value: any, callback: any) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.setPasswordForm.userPassword) {
        callback(new Error('两次输入密码不一致!'))
      } else {
        callback()
      }
    }
    return {
      // ?消息通知
      notiInfo: false,
      notifyData: false,
      respnoses: [],
      notifyNum: 0,
      // ------
      isFullScren: false,
      isBaseInfoVisible: false,
      isRealAuthVisible: false,
      isSafeSetVisible: false,
      isComInfoVisible: false,
      isUserEntranceDropdown: false,
      isCompanyDropdown: false,
      companyList: [],
      defaultCompanyName: [{ companyName: '归属公司名称' }],
      setPasswordRulr: {
        userVerifyCode: [{ required: true, min: 6, message: '验证码长度最少为6位', trigger: 'blur' }],
        userMobileNo: [{ required: true, trigger: 'blur', validator: validatorFun(validateMobile) }],
        userPassword: [{ required: true, validator: validatorFun(validatePassword), trigger: 'blur' }],
        confirmPassword: [{ required: true, trigger: 'blur', validator: validatorFun(validatePassword) }, { trigger: 'blur', validator: validatePass }]
      },
      setPasswordForm: {
        userPassword: '',
        mobileNoStatus: false,
        confirmPassword: '',
        userMobileNo: '',
        userVerifyCode: ''
      },
      isSetPassword: false,
      passwordType: 'password',
      msgTime: MSGTIME,
      activeMsgText: MSGINIT,
      msgKey: false
    }
  }

  public get token(): string {
    return this.getMenuData.token
  }


  public get userInfo(): any {
    return this.getMenuData.userInfo
  }

  public created() {
    if (this.$store.state.menu.tokenObj.lesseeKey === '') {
      setTimeout(() => {
        // this.fetchOrgInfo(this)
      }, 2000)
    }
    this.fetchUserInfo(this)
    this.getCompanyList()
  }
  public mounted() {
    this.eventListenerBychild()
    this.validateUserPassword()
    setTimeout(() => {
      this.connect(this.$store.state.menu.token, this.$store.state.menu.tokenObj.sub)
    }, 250)
  }
  public beforeDestroy() {
    if (stompClient != null) {
      stompClient.disconnect()
    }
  }
    public validateNull(val: any) {
      return validateNull(val)
    }
    /**
     * 连接socket
     */
    public connect(token: string, userId: string) {
      let socket
      let timerSend: any
      const _this = this
      // 1.连接SockJS的endpoint是“endpointWisely”，与后台代码中注册的endpoint要一样。
      const api = (this as any).$api.WEBSOCKET_NOTIFY_URL
      socket = new SockJS(api)
      // 2.创建STOMP协议的webSocket客户端。旨在WebSockets上运行而不是TCP。
      stompClient = (Stomp as any).over(socket)
      stompClient.debug = function(str: string) {
        console.log()
      }
      // 3.连接webSocket的服务端。
      stompClient.connect(
        {},
        (frame: any) => {
          // 4.订阅socket信息
          stompClient.subscribe(
            `/user/${userId}/message`,
            (respnose: any) => {
              // console.log('stompClient.subscribe', respnose.body)
              const res = JSON.parse(respnose.body)
              const resMsg = res.messages
              const showNotiArr = []
              if (resMsg) {
                for (let i = 0; i < resMsg.length; i++) {
                  const ele = resMsg[i]
                  if (i < 5) { showNotiArr.push(ele) }
                }
                // console.log('_this.respnoses', _this.respnoses)
                _this.respnoses = showNotiArr
                _this.notifyData = true
                _this.notifyNum = res.unreadNum
              }
            }
          )
          // console.log('发送-->')
          timerSend = setInterval(() => {
            stompClient.send('/message/user', {}, token)
          }, 5000)
        },
        (reject: any) => {
          console.error('请求连接超时,请重新连接')
          clearInterval(timerSend)
        }
      )
    }
    public goNotify() {
      console.log('goNotify')
      this.setCurrentMenuIndex(',0')
      this.setMainContentUrl('/Notify')
    }
    public notiDetail(arg: string) {
      // console.log('arg', arg)
      this.setCurrentMenuIndex(',0')
      this.setMainContentUrl(`/Notify?messageId=${arg}`)
    }
    public showNoti(bool: boolean) {
      if (bool) {
        NOTI_TIMERIN = setTimeout(() => {
          this.notiInfo = bool
        }, 150)
        clearTimeout(NOTI_TIMEROUT)
      } else {
        NOTI_TIMEROUT = setTimeout(() => {
          this.notiInfo = bool
        }, 150)
        clearTimeout(NOTI_TIMERIN)
      }
    }
    public showUserInfo(bool: boolean) {
      if (bool) {
        USER_TIMERIN = setTimeout(() => {
          this.isUserEntranceDropdown = bool
        }, 150)
        clearTimeout(USER_TIMEROUT)
      } else {
        USER_TIMEROUT = setTimeout(() => {
          this.isUserEntranceDropdown = bool
        }, 150)
        clearTimeout(USER_TIMERIN)
      }
    }
    /**
     * 利用H5的Storage来监听状态变化
     */
    public eventListenerBychild() {
      const _this = this
      window.addEventListener('storage', function(e) {
        if (e.newValue === 'openComInfo') {
          _this.$data.isComInfoVisible = true
          localStorage.removeItem('openComInfo')
        }
      })
    }
    public handleDropdown(command: string) {
      // this.isUserEntranceDropdown = false
      // this.isCompanyDropdown = false
      switch (command) {
        case 'baseInfo':
          this.$data.isBaseInfoVisible = true
          break
        case 'realAuth':
          this.$data.isRealAuthVisible = true
          break
        case 'safeSet':
          this.$data.isSafeSetVisible = true
          break
        case 'comInfo':
          this.$data.isComInfoVisible = true
          break

        case 'logOut':
          localStorage.clear()
          sessionStorage.clear()
          location.reload()
          // console.log(this.$store)
          break
        default:
          console.log(command)
      }
    }
    public handleScreen() {
      if (fullscreenEnable()) {
        exitFullScreen()
        // this.isFullScren = false
      } else {
        reqFullScreen()
        // this.isFullScren = true
      }
      listenfullscreen(() => {
        if (fullscreenEnable()) {
          // console.log('进入全屏')
          this.isFullScren = true
          this.setIsFullscreen(true)
        } else {
          // console.log('退出全屏')
          this.isFullScren = false
          this.setIsFullscreen(false)
        }
      })
    }
    /**
     * 企业列表
     */
    public async getCompanyList() {
      try {
        const resData = await this.$apollo.query({
          query: a.companyByToken,
          variables: {
            token: this.$store.state.menu.token
          },
          // 不在本地缓存,值通过网络
          fetchPolicy: 'network-only'
        })
        this.companyList = resData.data.companyByToken
        // console.log(this.companyList)
        // console.log(this.$store.state.menu.tokenObj)
        this.defaultCompanyName = this.companyList.filter((obj: any) => {
          if (this.$store.state.menu.tokenObj.def === obj.companyNo) {
            return obj
          }
        })
        this.companyList = this.companyList.filter((obj: any) => {
          if (this.$store.state.menu.tokenObj.def !== obj.companyNo) {
            return obj
          }
        })
        // console.log(' this.companyList', this.companyList)
      } catch (error) {
        console.error(error)
      }
    }
    public async addUserPassword() {
      (this as any).$refs.setPasswordForm.validate((valid: boolean) => {
        if (valid) {
          this.$apollo.mutate({
            mutation: a.editUserByMe,
            variables: {
              token: this.$store.state.menu.token,
              userEditByMe: {
                newPassword: this.setPasswordForm.userPassword,
                currentVerifyCode: this.setPasswordForm.userVerifyCode
              }
            }
          }).then((res: any) => {
            const adata = res.data
            if (adata !== null) {
              this.$message({
                message: '密码设置成功！',
                type: 'success'
              })
              this.isSetPassword = false;
              (this as any).$refs.setPasswordForm.clearValidate()
            } else {
              throw new Error(`${res.errors}`)
            }
          }).catch((err: any) => {
            const errors = JSON.parse(JSON.stringify(err)).graphQLErrors[0].gerrType
            let errorMsg = '密码修改失败'
            if (errors === 'InvalidParam') {
              errorMsg = '验证码错误'
            }
            this.$message({
              message: errorMsg,
              type: 'error'
            })
          })
        }
      })
    }
    public async handleClose() {
      (this as any).$refs.setPasswordForm.clearValidate()
      this.setPasswordForm = {
        userPassword: '',
        confirmPassword: ''
      }
    }
    public async validateUserPassword() {
      if (this.$store.state.menu.isFirstLogin === 'true') {
        try {
          const resData = await this.$apollo.query({
            query: a.userByMe,
            variables: {
              token: this.$store.state.menu.token
            },
            // 不在本地缓存,值通过网络
            fetchPolicy: 'network-only'
          })
          const isPwd = resData.data.userByMe.isPwd
          this.setPasswordForm.userMobileNo = resData.data.userByMe.mobileNo
          this.setPasswordForm.mobileNoStatus = true
          setTimeout(() => {
            if (!isPwd) {
              this.isSetPassword = true
            } else {
              this.isSetPassword = false
            }
          }, 2000)
          this.$store.commit('setFirstLogin', 'false')
        } catch (error) {
          console.error(error)
        }
      }
    }
    public showPassword() {
      this.passwordType === ''
        ? (this.passwordType = 'password')
        : (this.passwordType = '')
    }
    public async handleSendNew() {
      if (this.msgKey) { return }
      const isVali = validateMobile(this.setPasswordForm.userMobileNo)
      if (!isVali[0]) {
        this.$message.error('新手机号码不正确,请重新输入!')
        return
      }
      try {
        this.activeMsgText = MSGSCUCCESS.replace('#{time}', this.msgTime)
        this.msgKey = true
        const time = setInterval(() => {
          this.msgTime--
          this.activeMsgText = MSGSCUCCESS.replace('#{time}', this.msgTime)
          if (this.msgTime === 0) {
            this.activeMsgText = MSGINIT
            this.msgTime = MSGTIME
            this.msgKey = false
            clearInterval(time)
          }
        }, 1000)
        const verifyCode = await this.$apollo.mutate({
          mutation: a.newVerifyCodeByMobileNo,
          variables: {
            mobileNo: this.setPasswordForm.userMobileNo
          }
        })
      } catch (error) {
        console.error(error)
      }
    }
}
</script>

<style lang="scss" >
// 消息css
.notify-entrance-dropdown {
  position: absolute;
  top: 48px;
  right: 97px;
  float: left;
  list-style: none;
  background-color: #fff;
  color: #191d21;
  background-clip: padding-box;
  z-index: 9;
  font-size: 12px;
  min-width: 288px;
  margin: 0;
  border: none;
  transition: opacity 0.15s, visibility 0s 0.15s;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  // height: 377px;
  .notify-entrance-list {
    margin: {
      top: 5px;
      right: 0;
      left: 0;
      bottom: 0;
    }
    padding: 0;
    li {
      padding: 12px 24px;
      border-bottom: 1px solid #d3d7d9;
      list-style: none;
      p {
        margin: 0;
        margin-bottom: 4px;
        font-size: 14px;
        &:hover {
          color: #007eef;
          cursor: pointer;
          -webkit-transition: all 0.3s;
          -moz-transition: all 0.3s;
          -ms-transition: all 0.3s;
          -o-transition: all 0.3s;
          transition: all 0.3s;
        }
      }
      span {
        color: rgba(0, 0, 0, 0.45);
        cursor: default;
      }
    }
  }
  .notify-no-msg {
    height: 190px;
    line-height: 190px;
    font-size: 13px;
    text-align: center;
  }
  .notify-more-msg {
    height: 40px;
    width: 288px;
    text-align: center;
    line-height: 40px;
    &:hover {
      color: #007eef;
      cursor: pointer;
      -webkit-transition: all 0.3s;
      -moz-transition: all 0.3s;
      -ms-transition: all 0.3s;
      -o-transition: all 0.3s;
      transition: all 0.3s;
    }
  }
  a {
    color: #333744;
    font-size: 14px;
    margin-bottom: 5px;
    display: inline-block;
    width: 100%;
    height: 100%;
    &:hover {
      color: #007eef;
      cursor: pointer;
      -webkit-transition: all 0.3s;
      -moz-transition: all 0.3s;
      -ms-transition: all 0.3s;
      -o-transition: all 0.3s;
      transition: all 0.3s;
    }
  }
}
// 头像css
.user-entrance-dropdown {
  position: fixed;
  background-color: #fff;
  height: auto;
  width: 270px;
  right: 0;
  top: 48px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.user-entrance-user-info {
  text-align: center;
  padding-top: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eaeaea;
}
.user-entrance-list {
  overflow: hidden;
  width: 238px;
  margin: 16px 16px;
  padding: 0px;
  font-size: 14px;
}
.user-entrance-list li {
  display: inline-block;
  text-align: center;
  width: 32%;
  padding: 10.5px 0px;
  cursor: pointer;
}
.user-entrance-list li:hover {
  background: #f5f5f5;
}

.header-wrapper {
  background: #333744;
  .header-right-wrapper {
    float: right;
    height: 100%;
    display: table;
    .header-right-line {
      height: 100%;
      background: #2a2f32;
      width: 1px;
    }
    .header-right-box {
      height: 100%;
      display: table-cell;
      vertical-align: middle;
      padding-left: 10px;
      padding-right: 10px;
      .is-fixed {
        transform: translateY(10%) translateX(40%);
      }
    }
  }
}
.demo-input-suffix {
  padding-bottom: 10px;
}

.header-placeholder-class .el-form-item__content .el-input__inner {
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.header-placeholder-class
  .el-form-item__content
  .el-input.is-disabled
  .el-input__inner {
  background-color: #fff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #606266;
  cursor: default;
}
.header-placeholder-class .el-form-item.is-success .el-input__inner {
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.header-placeholder-class .el-form-item.is-error .el-input__inner {
  border-color: #f56c6c;
}

.header-placeholder-class
  .el-form-item.is-required
  .el-form-item__label:before {
  content: '';
}

.header-placeholder-class .el-form-item__content .el-card {
  background-color: #fff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #606266;
}

.header-placeholder-class .el-form {
  .el-form-item {
    margin-bottom: 15px;
  }
}
.header-placeholder-class .el-dialog {
  .el-dialog__body {
    text-align: center;
  }
}

.header-placeholder-class .el-dialog {
  margin-top: 58px !important;
  margin-bottom: 10px !important;
  min-height: 450px;
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 10px;
  }
}

.bottomBtn > div {
  margin-left: 0px !important;
  text-align: center;
}

.user-phone-num > input {
  background-color: #fff !important;
  color: #606266 !important;
}
</style>
