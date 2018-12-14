<template>
  <el-form class="login-form" status-icon :rules="loginRules" ref="loginForm" :model="loginForm" label-width="0">
    <el-form-item prop="username">
      <el-input @keyup.enter.native="handleLogin" v-model="loginForm.username" auto-complete="off" placeholder="请输入用户名或手机号"></el-input>
    </el-form-item>
    <el-form-item prop="password">
      <el-input @keyup.enter.native="handleLogin" :type="passwordType" v-model="loginForm.password" auto-complete="off" placeholder="请输入密码">
        <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
      </el-input>
    </el-form-item>
    <el-form-item prop="captcha">
      <el-row :span="24">
        <p v-if="waitShow" id="wait" class="show">正在加载验证码......</p>
        <el-col :span="24" class="captcha">
        </el-col>
      </el-row>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click.native.prevent="handleLogin" class="login-submit" :disabled="!loginForm.challenge|| !loginForm.validate|| !loginForm.seccode">登录</el-button>
      <el-button size="medium" style="position: relative; right: 0;" type="text" @click="handleRegister()">账号注册</el-button>
      <el-button size="medium" style="position: relative; right: 0;" type="text" @click="executorAppDownload()">执行人App下载</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Mutation, State, Getter, Action } from 'vuex-class'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue.ts'
import register from './register.vue'
import { initGeetest } from '@/utils/gt'
import * as g from '@/projects/menu/graphql/auth.gql'
import { validatorFun, validateUsername, validatePassword, randomLenNum } from '@/utils/string'
@Component({
  components: {
    register
  }
})
export default class UserLogin extends mixins(ExtVue) {
  @Mutation('setToken') private setToken?: any
  @Mutation('setFirstLogin') private setFirstLogin?: any
  @Action('newTokenByUserName') private newTokenByUserName: any
  private name: string =  'userlogin'
  private loginForm: any
  private passwordType!: string
  private waitShow!: boolean
  public data() {
    const validatorCode = (rule: any, value: any, callback: any) => {
      if (!this.loginForm.challenge || !this.loginForm.validate || !this.loginForm.seccode) {
        callback(new Error('请先完成验证'))
      } else {
        callback()
      }
    }
    const checkValid = (rule: any, value: any, callback: any) => {
      if (value.length === 11) { callback() } else {
        if (!/[a-zA-Z0-9]*[a-z]+[a-zA-Z0-9]*/.test(value)) { callback(new Error('请输入有效的用户名')) } else { callback() }
      }
    }
    const checkPhoneLogin = (rule: any, value: any, callback: any) => {
      if (/^\d+$/.test(value) && !/^1\d{10}$/.test(value)) { callback(new Error('请输入正确的手机号')) } else { callback() }
    }
    return {
      waitShow: true,
      loginForm: {
        username: '',
        password: '',
        challenge: '',
        validate: '',
        seccode: '',
        _this: ''
      },
      loginRules: {
        username: [
          { min: 3, message: '用户名长度最少为3位', trigger: 'blur' },
          { required: true, validator: checkPhoneLogin, trigger: 'blur' },
          { required: true, validator: checkValid, trigger: 'blur' }
        ],
        password: [
          { min: 6, message: '密码长度最少为6位', trigger: 'blur' },
          { required: true, trigger: 'blur', validator: validatorFun(validatePassword) }
        ],
        captcha: [
          { required: true, trigger: 'blur', validator: validatorCode }
        ]
      },
      passwordType: 'password'
    }
  }
  public created() {
    this.refreshCode()
  }
    public refreshCode() {
      this.$apollo
        .mutate({
          mutation: g.newCaptcha
        })
        .then((response: any) => {
          // console.log(response.data)
          // 调用 initGeetest 初始化参数
          // 参数1：配置参数
          // 参数2：回调，回调的第一个参数验证码对象，之后可以使用它调用相应的接口
          initGeetest({
            gt: response.data.newCaptcha.gt,
            challenge: response.data.newCaptcha.challenge,
            new_captcha: response.data.newCaptcha.new_captcha, // 用于宕机时表示是新验证码的宕机
            offline: !response.data.newCaptcha.success, // 表示用户后台检测极验服务器是否宕机，一般不需要关注
            product: 'float', // 产品形式，包括：float，popup
            width: '100%'
            // 更多配置参数请参见：http://www.geetest.com/install/sections/idx-client-sdk.html#config
          }, (captchaObj: any) => {
            // 只加载一次
            if (this.waitShow) {
              captchaObj.appendTo(`.captcha`)
            }
            captchaObj.onReady(() => {
              this.waitShow = false
            })
            // 验证成功
            captchaObj.onSuccess(() => {
              const result = captchaObj.getValidate()
              this.loginForm.challenge = result.geetest_challenge
              this.loginForm.validate = result.geetest_validate
              this.loginForm.seccode = result.geetest_seccode
              this.loginForm._this = this
              // console.log('this.loginForm.challenge=' + this.loginForm.challenge)
              // console.log('this.loginForm.validate=' + this.loginForm.validate)
              // console.log('this.loginForm.seccode=' + this.loginForm.seccode)
              // console.log('this.loginForm._this=' + this.loginForm._this)
            })
            // 验证失败
            captchaObj.onError(() => {
              this.loginForm.challenge = ''
              this.loginForm.validate = ''
              this.loginForm.seccode = ''
              this.loginForm._this = ''
            })
          })
        }).catch(
          (err: any) => { console.log(err) }
        )
    }
    public showPassword() {
      this.passwordType === ''
        ? (this.passwordType = 'password')
        : (this.passwordType = '')
    }
    public handleLogin() {
      (this as any).$refs.loginForm.validate(async (valid: any) => {
        if (valid) {
          const temp = await this.newTokenByUserName({
            userName: this.loginForm.username,
            password: this.loginForm.password,
            challenge: this.loginForm.challenge,
            validate: this.loginForm.validate,
            seccode: this.loginForm.seccode,
            serverNos: [],
            companyNos: [],
            lesseeId: this.$store.state.menu.lesseeInfo.lesseeId
          })
          console.log(temp)
          Object.keys(temp).forEach((params) => {
            if (params === 'data') {
              const token = temp.data.newTokenByUserName.token
              this.setToken(token)
              this.setFirstLogin('true')
              this.$router.push('/')
            } else {
              if (temp.message === 'GraphQL error: UserName or Password or lesseeId error') {
                this.$message({
                  message: '用户名或密码错误或已被停用!',
                  type: 'warning'
                })
                setTimeout(() => {
                  location.reload()
                }, 1500)
              } else {
                this.$message({
                  message: '哦哦,不小心失败了,请刷新!',
                  type: 'error'
                })
                throw new Error(`登录失败`)
              }
            }
          })
        }
      })
    }
    public handleRegister() {
      this.$router.push('/register')
    }
    public executorAppDownload() {
      // this.$router.push('/newPages.html')
      this.$router.push('/demo')
    }
}
</script>

<style>
</style>
