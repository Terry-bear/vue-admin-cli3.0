<template>
  <div>
    <el-dialog :title="title" center :visible.sync="isComInfoVisible" :before-close="cancleBtn" width="600px">
      <el-tag style="margin-bottom: 10px;" :type="certifiedStatus | fStatus">{{certifiedStatus | fCerStatus}}</el-tag>
      <el-alert v-if="certifiedStatus === 0" title="驳回原因" type="error" :description="certifiedFeedback">
      </el-alert>
      <el-form v-loading="loading" label-position="left" :rules="rules" :model="showObj" ref="form" label-width="150px">
        <el-form-item label="企业名称" prop="orgName">
          <el-input v-model="showObj.orgName"></el-input>
        </el-form-item>
        <el-form-item label="企业所在地" prop="regAddress">
          <el-input v-model="showObj.regAddress"></el-input>
        </el-form-item>
        <el-form-item label="所属行业" prop="industry">
          <el-select v-model="showObj.industry">
            <el-option v-for="item in industryOpt" :key="item.value" :label="item.label" :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业规模" prop="personScale">
          <el-select v-model="tempPersonScale" value-key="label">
            <el-option v-for="item in personScaleOpt" :key="item.value" :label="item.label" :value="item">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业类型" prop="orgType">
          <el-select v-model="showObj.orgType">
            <el-option v-for="item in orgTypeOpt" :key="item.value" :label="item.label" :value="item.label">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="企业法人" prop="legalPerson">
          <el-input v-model="showObj.legalPerson"></el-input>
        </el-form-item>
        <el-form-item label="企业联系人" prop="contactPerson">
          <el-input v-model="showObj.contactPerson"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="showObj.contactPhone"></el-input>
        </el-form-item>
        <el-form-item label="企业邮箱">
          <el-input v-model="showObj.orgEmail"></el-input>
        </el-form-item>
        <el-form-item label="企业网址">
          <el-input v-model="showObj.orgUrl"></el-input>
        </el-form-item>
        <el-form-item label="统一社会信用代码">
          <el-input v-model="showObj.orgCode" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="营业执照">
          <div style="height: 100px; width: 160px; display: flex; flex-direction: row;">
            <label v-for="ite in strUrlsToArr" :key="ite.dex">
              <div style="margin-left:30px;height: 100px; width: 160px">
                <up-load :picSrc="ite" :isAdd="false" :bucketUrl="bucketUrl" ref="upLoad"></up-load>
              </div>
            </label>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <center>
          <el-button type="primary" @click="submits()">修改</el-button>
        </center>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue.ts'
import UpLoad from '@/projects/menu/views/components/UpLoad.vue'
import * as o from '@/projects/menu/graphql/org.gql'
import * as a from '@/projects/menu/graphql/auth.gql'
Vue.filter('fCerStatus', function(arg: any) {
  arg = arg.toString()
  const enumCertifiedStatus = [{
    value: '1',
    label: '信息已审核'
  }, {
    value: '0',
    label: '审核被驳回'
  }, {
    value: '-1',
    label: '注册审核'
  }, {
    value: '-2',
    label: '信息审核中'
  }]
  enumCertifiedStatus.filter((obj) => {
    if (obj.value === arg) {
      arg = obj.label
    }
  })
  return arg
})
Vue.filter('fStatus', function(arg: any) {
  arg = arg.toString()
  const enumCertifiedStatus = [{
    value: '1',
    label: 'success'
  }, {
    value: '0',
    label: 'danger'
  }, {
    value: '-1',
    label: 'info'
  }, {
    value: '-2',
    label: 'warning'
  }]
  enumCertifiedStatus.filter((obj) => {
    if (obj.value === arg) {
      arg = obj.label
    }
  })
  return arg
})
@Component({
  components: {
    UpLoad
  }
})
export default class ComInfo extends mixins(ExtVue) {
  @Prop() private isComInfoVisible!: boolean
  private bucketUrl!: string
  private tempPersonScale!: any
  private showObj!: any
  private certifiedStatus!: any
  private certifiedFeedback!: any
  private loading!: boolean
  private thisOrgName!: any
  public data() {
    const checkChinese = (rule: any, value: any, callback: any) => {
      if (!/[\u4e00-\u9fa5]{2,30}/gm.test(value)) {
        return callback(new Error('请包含至少两个中文字符'))
      } else if (!/^([\u4E00-\u9FA5A-Za-z0-9_]{2,30})$/.test(value)) {
        return callback(new Error('不能含有特殊字符'))
      } else {
        callback()
      }
    }
    const checkLicense = (rule: any, value: any, callback: any) => {
      if ((this as any).$refs.upLoad.files.randomName === undefined) {
        return callback(new Error('请上传营业执照'))
      } else {
        callback()
      }
    }
    const checkName = async (rule: any, value: any, callback: any) => {
      if (value === '') { return callback(new Error('请输入企业名称')) }
      if (!/[\u4e00-\u9fa5]+/gm.test(value)) { return callback(new Error('请包含中文字符')) }
      console.log(this.thisOrgName)
      if (value !== '' && value !== this.thisOrgName) {
        const { data } = await this.$apollo.query({
          query: a.existCodeOrName,
          variables: {
            orgName: value
          },
          fetchPolicy: 'network-only'
        })
        if (data.existOrgCodeOrOrgNameByToken) {
          return callback(new Error('企业名称已被注册'))
        } else {
          return callback()
        }
      } else {
        return callback()
      }
    }
    return {
      thisOrgName: '',
      key: '',
      title: '企业详情',
      tempPersonScale: '',
      showObj: {},
      urls: '',
      loading: true,
      bucketUrl: '',
      certifiedStatus: '',
      certifiedFeedback: '',
      orgTypeOpt: [{
        value: '1',
        label: '公司'
      }, {
        value: '2',
        label: '工厂'
      }, {
        value: '3',
        label: '劳务公司'
      }],
      personScaleOpt: [{
        value: '1',
        label: '1-50'
      }, {
        value: '2',
        label: '51-100'
      }, {
        value: '3',
        label: '101-500'
      }, {
        value: '4',
        label: '501-1000'
      }, {
        value: '5',
        label: '1001-10000'
      }, {
        value: '6',
        label: '10000以上'
      }],
      industryOpt: [{
        value: '1',
        label: '制造业'
      }, {
        value: '2',
        label: '服务业'
      }, {
        value: '3',
        label: 'IT/科技业'
      }, {
        value: '4',
        label: '建筑业'
      }, {
        value: '5',
        label: '农业'
      }, {
        value: '6',
        label: '商业'
      }, {
        value: '7',
        label: '渔业'
      }],
      rules: {
        orgName: [
          { required: true, validator: checkName, trigger: 'blur' }
        ],
        regAddress: [
          { required: true, message: '请输入企业所在地', trigger: 'blur' }
        ],
        industry: [
          { required: true, message: '请选择所属行业', trigger: 'change' }
        ],
        personScale: [
          { required: true, message: '请选择企业规模', trigger: 'change' }
        ],
        orgType: [
          { required: true, message: '请选择企业类型', trigger: 'change' }
        ],
        legalPerson: [
          { required: true, message: '请输入企业法人', trigger: 'blur' },
          { required: true, validator: checkChinese, trigger: 'blur' }
        ],
        contactPerson: [
          { required: true, message: '请输入企业联系人', trigger: 'blur' },
          { required: true, validator: checkChinese, trigger: 'blur' }
        ],
        contactPhone: [
          { required: true, message: '请输入联系电话', trigger: 'blur' },
          { pattern: /^\d{11}$/, message: '请输入正确的联系电话', trigger: 'blur' }
        ]
      }
    }
  }
  public async created() {
    this.bucketUrl = this.$store.state.menu.tokenObj.url
    await this.showData()
    this.tempPersonScale = this.showObj.personScale ? JSON.parse(this.showObj.personScale).label : this.showObj.personScale
  }

  public get strUrlsToArr(): any {
    return this.showObj.licensePicUrl ? JSON.parse(this.showObj.licensePicUrl) : ['']
  }
    public async showData() {
      try {
        const res = await this.$apollo.provider.clients.org.query({
          query: o.orgByMe,
          variables: {
            token: this.$store.state.menu.token,
            orgNo: this.$store.state.menu.tokenObj.def
          },
          fetchPolicy: 'network-only'
        })
        // console.log('res.data', res.data)
        let adata
        res.data.orgByMe.newestOrg ? adata = JSON.parse(JSON.stringify(res.data.orgByMe.newestOrg)) : adata = JSON.parse(JSON.stringify(res.data.orgByMe))
        this.certifiedStatus = res.data.orgByMe.certifiedStatus
        this.certifiedStatus === 0
          ? this.certifiedFeedback = res.data.orgByMe.certifiedFeedback
          : this.certifiedStatus = this.certifiedStatus
        // console.log('adata', adata)
        this.thisOrgName = adata.orgName
        this.showObj = adata
        this.loading = false
      } catch (error) {
        console.error(error)
        this.loading = false
      }
    }
    public async submits() {
      (this as any).$refs.form.validate(async (vaild: boolean) => {
        if (vaild) {
          let showObj: any
          showObj = this.$utils.deepCopy(this.showObj)
          const { orgName, regAddress, industry, personScale, orgType, legalPerson, contactPerson, contactPhone, orgEmail, orgCode, licensePicUrl } = showObj
          let { orgUrl } = showObj
          if (/^(www)/.test(orgUrl) && !/^(https:\/\/)/.test(orgUrl)) { orgUrl = `https://${orgUrl}` }
          showObj = {
            orgName,
            regAddress,
            industry,
            orgType,
            legalPerson,
            contactPerson,
            contactPhone,
            orgEmail,
            orgUrl,
            orgCode
          }
          this.loading = true
          if (orgEmail === null) { delete showObj.orgEmail }
          if (orgUrl === null) { delete showObj.orgUrl }
          const isUpdate = await (this as any).$refs.upLoad[0].upLoadFile()
          isUpdate
            ? showObj.licensePicUrls = (this as any).$refs.upLoad[0].urls
            : showObj.licensePicUrls = JSON.parse(licensePicUrl)
          typeof this.tempPersonScale === 'object' && this.tempPersonScale !== ''
            ? showObj.personScale = JSON.stringify(this.tempPersonScale)
            : showObj.personScale = personScale
          try {
            const res = await this.$apollo.provider.clients.org.mutate({
              mutation: o.editOrgByCoBo,
              variables: {
                token: this.$store.state.menu.token,
                companyNo: this.$store.state.menu.tokenObj.def,
                orgEditByCoBo: showObj
              }
            })
            this.$message({
              message: '修改成功~',
              type: 'success'
            })
            setTimeout(() => {
              this.$emit('isComInfoVisible', false)
            }, 1000)
          } catch (error) {
            if (JSON.parse(JSON.stringify(error)).message.includes('email')) {
              this.$message({
                message: '企业邮箱错误，请重新输入！',
                type: 'error'
              })
            } else if (JSON.parse(JSON.stringify(error)).message.includes('url')) {
              this.$message({
                message: '企业网址错误，请重新输入！',
                type: 'error'
              })
            } else {
              this.$message({
                message: '修改失败了~',
                type: 'error'
              })
            }
            this.loading = false
          }
        } else {
          this.loading = false
          this.$message({
            message: '请按照提示进行修改!',
            type: 'warning'
          })
          return false
        }
      })
    }
    @Emit('isComInfoVisible')
    public cancleBtn() {
      return false
    }
}
</script>

<style lang="scss" scoped>
.el-input,
.el-select {
  width: 350px !important;
}
</style>
