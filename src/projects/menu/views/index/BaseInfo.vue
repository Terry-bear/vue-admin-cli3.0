<template>
  <div>
    <el-dialog title="基本信息" center :visible.sync="isBaseInfoVisible" width="600px" :before-close="cancleBtn">
      <el-form label-position="left" label-width="100px" status-icon :rules="baseInfoRules" ref="baseInfoForm" :model="baseInfoForm">
        <head-pic ref="oss" :picUrl="baseInfoForm.headpic"></head-pic>
        <div style="margin:10px auto;text-align:center;">头像</div>
        <el-form-item prop="userName" label="用户名">
          <el-input v-model="baseInfoForm.userName" placeholder="" :disabled="isWrite"></el-input>
        </el-form-item>
        <el-form-item prop="fullName" label="姓名">
          <el-input v-model="baseInfoForm.fullName" placeholder="" :disabled="NotWrite"></el-input>
        </el-form-item>
        <el-form-item prop="idCard" label="身份证">
          <el-input v-model="baseInfoForm.idCard" placeholder="" :disabled="NotWrite"></el-input>
        </el-form-item>

        <el-form-item prop="phone" label="手机号">
          <el-input v-popover:popover v-model="baseInfoForm.phone" placeholder="暂无手机号" :disabled="forbidWrite"></el-input>
          <el-popover ref="popover" offset="0" placement="top-start" title="" width="100%" trigger="click" content="手机号修改请,访问安全设置!" />
        </el-form-item>
        <el-form-item v-if="baseInfoForm.eMail" prop="eMail" label="邮箱">
          <el-input v-model="baseInfoForm.eMail" placeholder="" :disabled="forbidWrite"></el-input>
        </el-form-item>
        <el-form-item v-if="baseInfoForm.lastResetDate" prop="lastResetInstant" label="最近改密时间">
          <el-card shadow="hover" :body-style="{padding:'0px 15px'}">{{baseInfoForm.lastResetDate}}</el-card>
        </el-form-item>
        <el-form-item v-if="baseInfoForm.lastLoginDate" prop="lastLoginInstant" label="最近登录时间">
          <el-card shadow="hover" :body-style="{padding:'0px 15px'}" style="text-align: start;">{{baseInfoForm.lastLoginDate}}</el-card>
        </el-form-item>
        <el-form-item class="bottomBtn">
          <el-button type="primary" @click="submitInfo" :disabled="isWrite && NotWrite">确 定</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import {mixins} from 'vue-class-component'
import ExtVue from 'mixin/ExtVue.ts'
import * as g from '@/projects/menu/graphql/auth.gql'
import { validatorFun, validateName, validateIdCard, validateUsername, validateNull } from '@/utils/string'
import { Loading } from 'elementUI'
import HeadPic from '@/projects/menu/views/components/HeadPic.vue'
interface BaseInfoForm {
    headpic: string
    userName: string
    fullName: string
    idCard: string
    phone: string
    eMail: string
    lastLoginDate: string
    lastResetDate: string
  }
@Component({
  components: {
    HeadPic
  }
})
export default class BaseInfo extends mixins(ExtVue) {
  @Prop() private isBaseInfoVisible: any
  private baseInfoForm!: BaseInfoForm
  private NotWrite!: boolean
  private isWrite!: boolean
  public data() {
    return {
      baseInfoForm: {
        headpic: '',
        userName: '',
        fullName: '',
        idCard: '',
        phone: '',
        eMail: '',
        lastLoginDate: '',
        lastResetDate: ''
      },
      forbidWrite: true,
      NotWrite: false,
      isWrite: false,
      imageUrl: '',
      loading: true,
      baseInfoRules: {
        userName: [
          { required: true, trigger: 'blur', validator: validatorFun(validateUsername) }
        ],
        fullName: [
          { required: false, trigger: 'blur', validator: validatorFun(validateName) }
        ],
        idCard: [{ required: false, trigger: 'blur', validator: validatorFun(validateIdCard, true) }]
      }

    }
  }
  public async created() {
    await this.showData()
  }
  public async showData() {
    try {
      const loadingInstance = Loading.service({ target: '.el-dialog' })
      const resData = await this.$apollo.query({
        query: g.userByMe,
        variables: {
          token: this.$store.state.menu.token
        },
        // 不在本地缓存,值通过网络
        fetchPolicy: 'network-only'
      })
      // 用户名,姓名,身份证,手机号,邮箱,头像,状态信息,最近修改密码时间,最近登录时间
      // certifiedStatus: Int 1 0 不能修改身份证和姓名
      const { userName, name, idCard, mobileNo, email, headpic, certifiedStatus, lastResetDate, lastLoginDate } = resData.data.userByMe
      this.baseInfoForm.headpic = headpic
      this.baseInfoForm.userName = userName
      this.baseInfoForm.fullName = name
      this.baseInfoForm.idCard = idCard
      this.baseInfoForm.phone = mobileNo
      this.baseInfoForm.eMail = email
      this.baseInfoForm.lastResetDate = lastResetDate
      this.baseInfoForm.lastLoginDate = lastLoginDate
      await loadingInstance.close()
      if (certifiedStatus === 1 || certifiedStatus === 0) {
        // console.log('NotWrite', this.NotWrite)
        this.NotWrite = true
      }
      // 判断是否是32位用户名,true则可以编辑一次userName
      if (userName.length !== 32) {
        this.isWrite = true
      }
    } catch (error) {
      console.error(error)
      throw new Error(`query--userByMe-->${error}`)
    }
  }
  /**
   * 修改个人信息
   *
   */
  public async mutationData() {
    // console.log('token', this.$store.state.menu.token)
    try {
      interface FirstVariables {
        name: string
        idCard?: any
        userName?: any
      }
      const { userName, fullName, idCard } = this.baseInfoForm
      const firstVariables: FirstVariables = {
        name: fullName
      }
      if (!validateNull(idCard)) {
        firstVariables.idCard = idCard
      }
      if (!this.isWrite) {
        firstVariables.userName = userName
      }
      const res = await this.$apollo.mutate({
        mutation: g.editUserByMe,
        variables: {
          token: this.$store.state.menu.token,
          userEditByMe: firstVariables
        }
      })
      const adata = res.data
      if (adata !== null) {
        this.$message({
          message: '修改基本信息成功',
          type: 'success'
        })
        (this as any).$refs.baseInfoForm.clearValidate()
        // this.showData()
      } else {
        throw new Error(`mutation--editUserByMe-->${res.errors}`)
      }
    } catch (error) {
      this.$message({
        message: '修改基本信息失败',
        type: 'error'
      })
      throw new Error(`mutation--editUserByMe-->${error}`)
    }
  }
  @Emit('isBaseInfoVisible')
  public cancleBtn() {
    (this as any).$refs.baseInfoForm.clearValidate()
    return false
  }
  public submitInfo() {
    (this as any).$refs.baseInfoForm.validate(async (valid: any) => {
      if (valid) {
        this.mutationData()
      }
    })
  }
}
</script>
<style lang="scss" scoped>
.el-input {
  padding-top: 5px;
  display: inline-block !important;
}
.demo-input-suffix {
  padding-bottom: 10px;
}
</style>
