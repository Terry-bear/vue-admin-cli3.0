<template>
  <div>
    <el-dialog title="安全认证" center :visible.sync="isSafeSetVisible" width="600px" :before-close="handleClose">
      <el-tabs v-model="activeName" type="card" @tab-click="handleTabClick">
        <el-tab-pane label="手机号码" name="editPhone" />
        <el-tab-pane label="修改密码" name="editPassword" />
      </el-tabs>
      <el-form v-loading="loading" label-position="left" label-width="100px" v-show="activeName=='editPhone'" status-icon :rules="editPhoneRules" ref="editPhoneForm" :model="editPhoneForm">
        <label v-if="hasPhoneNum">
          <el-form-item prop="mobileNo" label="当前手机号">
            <el-input v-model="editPhoneForm.mobileNo" auto-complete="off" placeholder="请输入当前手机号码" :disabled="editPhoneForm.mobileNoStatus"></el-input>
          </el-form-item>
          <el-form-item prop="verifyCode" label="验证码">
            <el-input v-model="editPhoneForm.verifyCode" auto-complete="off" placeholder="请输入验证码">
              <template slot="append">
                <span @click="handleSend" class="msg-text" :class="[{display:msgKey1}]">{{activeMsgText1}}</span>
              </template>
            </el-input>
          </el-form-item>
        </label>
        <label>
          <el-form-item prop="newMobileNo" label="新手机号">
            <el-input v-model="editPhoneForm.newMobileNo" auto-complete="off" placeholder="请输入新手机号码"></el-input>
          </el-form-item>
          <el-form-item prop="newVerifyCode" label="验证码">
            <el-input v-model="editPhoneForm.newVerifyCode" auto-complete="off" placeholder="请输入验证码">
              <template slot="append">
                <span @click="handleSendNew" class="msg-text" :class="[{display:msgKey2}]">{{activeMsgText2}}</span>
              </template>
            </el-input>
          </el-form-item>
        </label>
        <el-form-item class="bottomBtn">
          <el-button type="primary" @click.native.prevent="handleEditPhone" :disabled="(hasPhoneNum && (!editPhoneForm.mobileNo|| !editPhoneForm.verifyCode))|| !editPhoneForm.newMobileNo|| !editPhoneForm.newVerifyCode">确 定</el-button>
        </el-form-item>
      </el-form>
      <el-form label-position="left" label-width="100px" v-show="activeName=='editPassword'" status-icon :rules="editPasswordRules" ref="editPasswordForm" :model="editPasswordForm">
        <el-form-item prop="password" label="当前密码">
          <el-input :type="passwordType" v-model="editPasswordForm.password" auto-complete="off" placeholder="请输入当前密码">
            <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="newPassword" label="新密码">
          <el-input :type="passwordType" v-model="editPasswordForm.newPassword" auto-complete="off" placeholder="请输入新密码">
            <i class="el-icon-view el-input__icon" slot="suffix" @click="showPassword"></i>
          </el-input>
        </el-form-item>
        <el-form-item class="bottomBtn">
          <el-button type="primary" @click.native.prevent="handleEditPassword" :disabled="!editPasswordForm.password|| !editPasswordForm.newPassword">确 定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue.ts'
import * as a from '@/projects/menu/graphql/auth.gql'
import { Loading } from 'elementUI'
import { validatorFun, validateMobile, validatePassword } from '@/utils/string'
const MSGINIT = '发送验证码'
const MSGERROR = '验证码发送失败'
const MSGSCUCCESS = '#{time}秒后重发'
const MSGTIME = 120

@Component({})
export default class SafeSet extends mixins(ExtVue) {
  @Prop() private isSafeSetVisible: any
  private passwordType!: string
  private hasPhoneNum: any
  private editPhoneForm: any
  private editPasswordForm: any
  private msgKey1: any
  private activeMsgText1: any
  private msgTime1: any
  private msgKey2: any
  private activeMsgText2: any
  private msgTime2: any
  private activeName2: any
  private loading: any

  public data() {
    return {
      isFullScren: false,
      loading: true,
      msgTime1: MSGTIME,
      msgTime2: MSGTIME,
      msgKey1: false,
      msgKey2: false,
      activeMsgText1: MSGINIT,
      activeMsgText2: MSGINIT,
      activeName: 'editPhone',
      passwordType: 'password',
      hasPhoneNum: false,
      editPhoneForm: {
        mobileNo: '',
        mobileNoStatus: false,
        verifyCode: '',
        newMobileNo: '',
        newVerifyCode: ''
      },
      editPasswordForm: {
        password: '',
        newPassword: ''
      },
      editPhoneRules: {
        mobileNo: [{ required: true, trigger: 'blur', validator: validatorFun(validateMobile) }],
        verifyCode: [{ required: true, min: 6, message: '验证码长度最少为6位', trigger: 'blur' }],
        newMobileNo: [{ required: true, trigger: 'blur', validator: validatorFun(validateMobile) }],
        newVerifyCode: [{ required: true, min: 6, message: '验证码长度最少为6位', trigger: 'blur' }]
      },
      editPasswordRules: {
        password: [{ required: true, trigger: 'blur', validator: validatorFun(validatePassword) }],
        newPassword: [{ required: true, trigger: 'blur', validator: validatorFun(validatePassword) }]
      }
    }
  }
  public async mounted() {
    await this.showPhoneNum()
  }
  public showPassword() {
    this.passwordType === ''
      ? (this.passwordType = 'password')
      : (this.passwordType = '')
  }
  public handleEditPhone() {
    (this as any).$refs.editPhoneForm.validate((valid: boolean) => {
      if (valid) {
        this.$apollo.mutate({
          mutation: a.editUserByMe,
          variables: {
            token: this.$store.state.menu.token,
            userEditByMe: {
              currentVerifyCode: this.hasPhoneNum ? this.editPhoneForm.verifyCode : null,
              newMobileNo: this.editPhoneForm.newMobileNo,
              newVerifyCode: this.editPhoneForm.newVerifyCode
            }
          }
        }).then((res: any) => {
          const adata = res.data
          if (adata !== null) {
            this.$message({
              message: '修改手机号成功',
              type: 'success'
            })
            (this as any).$refs.editPhoneForm.clearValidate()
          } else {
            throw new Error(`${res.errors}`)
          }
        }).catch((err: any) => {
          console.log(err)
          this.$message({
            message: '修改手机号失败,请检查输入!',
            type: 'error'
          })
          throw new Error(`mutation--editUserByMe-->${err}`)
        }
        )
      }
    })
  }
  public handleEditPassword() {
    (this as any).$refs.editPasswordForm.validate((valid: boolean) => {
      if (valid) {
        // console.log('请求修改密码')
        this.$apollo
          .mutate({
            mutation: a.editUserByMe,
            variables: {
              token: this.$store.state.menu.token,
              userEditByMe: {
                currentPassword: this.editPasswordForm.password,
                newPassword: this.editPasswordForm.newPassword
              }
            }
          })
          .then((res: any) => {
            // console.log(res)
            const adata = res.data
            if (adata !== null) {
              this.$message({
                message: '修改密码成功',
                type: 'success'
              })
            } else {
              throw new Error(`${res.errors}`)
            }
          }).catch((err: any) => {
            console.log(err)
            this.$message({
              message: '修改密码失败,请检查输入!',
              type: 'error'
            })
            throw new Error(`mutation--editUserByMe-->${err}`)
          })
      }
    })
  }
  public async handleSend() {
    if (this.msgKey1) { return }
    const isVali = validateMobile(this.editPhoneForm.mobileNo)
    if (!isVali[0]) {
      this.$message.error('当前手机号码不正确,请重新输入!')
      return
    }
    try {
      this.activeMsgText1 = MSGSCUCCESS.replace('#{time}', this.msgTime1)
      this.msgKey1 = true
      const time = setInterval(() => {
        this.msgTime1--
        this.activeMsgText1 = MSGSCUCCESS.replace('#{time}', this.msgTime1)
        if (this.msgTime1 === 0) {
          this.activeMsgText1 = MSGINIT
          this.msgTime1 = MSGTIME
          this.msgKey1 = false
          clearInterval(time)
        }
      }, 1000)
      const verifyCode = await this.$apollo
        .mutate({
          mutation: a.newVerifyCodeByMobileNo,
          variables: {
            mobileNo: this.editPhoneForm.mobileNo
          }
        })
    } catch (error) {
      console.error(error)
      throw new Error(`mutation--newVerifyCodeByMobileNo-->${error}`)
    }
  }
  public async handleSendNew() {
    if (this.msgKey2) { return }
    const isVali = validateMobile(this.editPhoneForm.newMobileNo)
    if (!isVali[0]) {
      this.$message.error('新手机号码不正确,请重新输入!')
      return
    }
    try {
      this.activeMsgText2 = MSGSCUCCESS.replace('#{time}', this.msgTime2)
      this.msgKey2 = true
      const time = setInterval(() => {
        this.msgTime2--
        this.activeMsgText2 = MSGSCUCCESS.replace('#{time}', this.msgTime2)
        if (this.msgTime2 === 0) {
          this.activeMsgText2 = MSGINIT
          this.msgTime2 = MSGTIME
          this.msgKey2 = false
          clearInterval(time)
        }
      }, 1000)
      const verifyCode = await this.$apollo
        .mutate({
          mutation: a.newVerifyCodeByMobileNo,
          variables: {
            mobileNo: this.editPhoneForm.newMobileNo
          }
        })
    } catch (error) {
      console.error(error)
      throw new Error(`mutation--newVerifyCodeByMobileNo-->${error}`)
    }
  }
  public handleTabClick(tab: any, event: any) {
    if (tab.name === 'editPhone') {
      console.log('editPhone');
      (this as any).$refs.editPasswordForm.clearValidate()
    } else if (tab.name === 'editPassword') {
      console.log('editPassword');
      (this as any).$refs.editPhoneForm.clearValidate()
    }
  }
  @Emit('isSafeSetVisible')
  public async handleClose() {
    this.editPhoneForm = {
      mobileNo: '',
      verifyCode: '',
      newMobileNo: '',
      newVerifyCode: ''
    }
    this.editPasswordForm = {
      password: '',
      newPassword: ''
    }
    this.loading = true
    return false
  }
  /**
   * 获取手机号
   */
  public async showPhoneNum() {
    try {
      const resData = await this.$apollo.query({
        query: a.userByMe,
        variables: {
          token: this.$store.state.menu.token
        },
        // 不在本地缓存,值通过网络
        fetchPolicy: 'network-only'
      })
      const { mobileNo } = resData.data.userByMe
      // console.log('mobileNo->', mobileNo)
      if (mobileNo) {
        this.hasPhoneNum = true
        this.editPhoneForm.mobileNo = mobileNo
        this.editPhoneForm.mobileNoStatus = true
      }
      this.loading = false
    } catch (error) {
      console.error(error)
      throw new Error(`query--userByMe-->${error}`)
    }
  }
}
</script>

<style>
.msg-text {
  display: block;
  width: 60px;
  font-size: 12px;
  text-align: center;
  cursor: pointer;
}
.bottomBtn > div {
  margin-left: 0px !important;
  text-align: center;
}
.msg-text.display {
  color: #ccc;
}
</style>
