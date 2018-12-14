<template>
  <el-form class="login-form" status-icon :rules="loginRules" ref="loginForm" :model="loginForm" label-width="0">
    <el-form-item prop="mobileNo">
      <el-input @keyup.enter.native="handleLogin" v-model="loginForm.mobileNo" auto-complete="off" placeholder="请输入手机号码"></el-input>
    </el-form-item>
    <el-form-item prop="verifyCode">
      <el-input @keyup.enter.native="handleLogin" v-model="loginForm.verifyCode" auto-complete="off" placeholder="请输入验证码">
        <template slot="append">
          <span @click="handleSend" class="msg-text" :class="[{display:msgKey}]">{{msgText}}</span>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click.native.prevent="handleLogin" class="login-submit">登录</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import * as g from '@/projects/menu/graphql/auth.gql'
import { validatorFun, validateMobile } from '@/utils/string'
import { mapGetters } from 'vuex'
const MSGINIT = '发送验证码'
const MSGERROR = '验证码发送失败'
const MSGSCUCCESS = '#{time}秒后重发'
const MSGTIME = 120
interface LoginForm {
  mobileNo: string,
  verifyCode: string,
  _this?: any
}
@Component({})
export default class CodeLogin extends Vue {
  private name: string =  'codelogin'
  private msgText!: string
  private msgTime!: number
  private msgKey!: boolean
  private loginForm!: LoginForm
  private $apollo!: any
  private $store!: any
  private $router!: any
  public data() {
    return {
      msgText: MSGINIT,
      msgTime: MSGTIME,
      msgKey: false,
      loginForm: {
        mobileNo: '',
        verifyCode: '',
        _this: ''
      },
      loginRules: {
        mobileNo: [{ required: true, trigger: 'blur', validator: validatorFun(validateMobile) }],
        verifyCode: [{ required: true, min: 6, message: '验证码长度最少为6位', trigger: 'blur' }]
      }
    }
  }
   private handleSend() {
      if (this.msgKey) { return }
      if (!validateMobile(this.loginForm.mobileNo)) { return }
      this.msgText = MSGSCUCCESS.replace('#{time}', this.msgTime.toString())
      this.msgKey = true
      const time = setInterval(() => {
        this.msgTime--
        this.msgText = MSGSCUCCESS.replace('#{time}', this.msgTime.toString())
        if (this.msgTime === 0) {
          this.msgTime = MSGTIME
          this.msgText = MSGINIT
          this.msgKey = false
          clearInterval(time)
        }
      }, 1000)
      this.$apollo
        .mutate({
          mutation: g.newVerifyCodeByMobileNo,
          variables: {
            mobileNo: this.loginForm.mobileNo
          }
        })
        .then((res: any) => {
          // console.log(res.data.newVerifyCodeByMobileNo)
        }).catch(
          (err: any) => { console.log(err) }
        )
    }
private handleLogin() {
      this.loginForm._this = this;
      (this as any).$refs.loginForm.validate((valid: boolean) => {
        if (valid) {
          this.$store.dispatch('loginByPhone', this).then((res: any) => {
            this.$router.push({ path: '/' })
          })
        }
      })
    }
}
</script>

<style scoped>
.msg-text {
  display: block;
  width: 60px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}
.msg-text.display {
  color: #ccc;
}
</style>
