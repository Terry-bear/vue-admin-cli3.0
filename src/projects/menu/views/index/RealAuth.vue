<template>
  <el-dialog title="实名认证" center :visible.sync="isRealAuthVisible" width="600px" :before-close="handleClose">
    <el-form v-loading="loading" label-position="left" label-width="100px" status-icon :rules="realAuthRules" ref="realAuthForm" :model="realAuthForm">
      <el-form-item prop="name" label="姓名">
        <el-input v-model="realAuthForm.name" :disabled="realAuthForm.certifiedStatus===0 || realAuthForm.certifiedStatus === 1" auto-complete="off" placeholder="请输入姓名"></el-input>
      </el-form-item>
      <el-form-item prop="idCard" label="身份证">
        <el-input v-model="realAuthForm.idCard" :disabled="realAuthForm.certifiedStatus===0 || realAuthForm.certifiedStatus === 1" auto-complete="off" placeholder="请输入份证"></el-input>
      </el-form-item>
      <el-form-item v-if="realAuthForm.certifiedStatus!==null" prop="certifiedStatus" label="认证状态">
        <el-tag :type="realAuthForm.certifiedStatus===-1 ? 'danger' : ''">{{realAuthForm.certifiedStatus | certifiedFilter}}</el-tag>
      </el-form-item>
      <el-form-item v-if="realAuthForm.certifiedStatus===-1 || realAuthForm.certifiedStatus===null" class="bottomBtn">
        <el-button type="primary" @click.native.prevent="handleRealAuth" :disabled="!realAuthForm.name || !realAuthForm.idCard">{{realAuthForm.certifiedStatus===null? '申请实名认证':'重新实名认证'}}</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue.ts'
import { validatorFun, validateIdCard, validateName } from '@/utils/string'
import { Loading } from 'elementUI'
import * as a from '@/projects/menu/graphql/auth.gql'

interface RealAuthForm {
  name: string | null
  idCard: string | null
  certifiedStatus: string | null
}
Vue.filter('certifiedFilter', function(status: string) {
  const statusMap: any = {
      '0': '请求实名认证中',
      '1': '已通过实名认证',
      '-1': '未通过实名认证'
    }
  return statusMap[status]
})
@Component({})
export default class RealAuth extends mixins(ExtVue) {
  @Prop() public isRealAuthVisible: any
  private loading!: boolean
  private realAuthForm!: RealAuthForm
  public data() {
    return {
      loading: true,
      realAuthForm: {
        name: '',
        idCard: '',
        certifiedStatus: ''
      },
      realAuthRules: {
        name: [{ required: true, trigger: 'blur', validator: validatorFun(validateName) }],
        idCard: [{ required: true, trigger: 'blur', validator: validatorFun(validateIdCard) }]
      }
    }
  }
  public async mounted() {
    await this.showData()
  }
    public async handleRealAuth() {
      (this as any).$refs.realAuthForm.validate(async (valid: boolean) => {
        if (valid) {
          try {
            const { name, idCard } = this.realAuthForm
            const res = await this.$apollo.mutate({
              mutation: a.editUserByMe,
              variables: {
                token: this.$store.state.menu.token,
                userEditByMe: {
                  name,
                  idCard,
                  requestCertified: true
                }
              }
            })
            // console.log(res)
            const adata = res.data
            if (adata !== null) {
              this.$message({
                message: '申请实名认证成功',
                type: 'success'
              })
              (this as any).$refs.realAuthForm.clearValidate()
              this.showData()
            } else {
              this.$message({
                message: '申请实名认证失败',
                type: 'error'
              })
            }
          } catch (error) {
            this.$message({
              message: '申请实名认证时发生异常',
              type: 'warning'
            })
            throw new Error(`mutation--editUserByMe-->${error}`)
          }
        }
      })
    }

    public async showData() {
      try {
        const resData = await this.$apollo
          .query({
            query: a.userByMe,
            variables: {
              token: this.$store.state.menu.token
            },
            // 不在本地缓存,值通过网络
            fetchPolicy: 'network-only'
          })
        const { certifiedStatus, name, idCard } = resData.data.userByMe
        this.realAuthForm.name = name
        this.realAuthForm.idCard = idCard
        this.realAuthForm.certifiedStatus = certifiedStatus
        this.loading = false
      } catch (error) {
        console.error(error)
        throw new Error(`query--userByMe-->${error}`)
      }
    }
    @Emit('isRealAuthVisible')
    public handleClose() {
      (this as any).$refs.realAuthForm.clearValidate()
      this.loading = true
      return false
    }
    @Emit('isRealAuthVisible')
    public submitInfo() {
      return false
    }
}
</script>
<style scoped>
.el-input {
  padding-top: 5px;
  display: inline-block !important;
}
.demo-input-suffix {
  padding-bottom: 10px;
}
</style>
