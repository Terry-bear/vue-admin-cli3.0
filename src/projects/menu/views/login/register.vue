<template>
  <div class="god-wrapper">
    <div class="container">
      <div class="top-wrapper">
        <img :src="regIcon" alt="人和数据你值得拥有">
        <div class="title-wrapper">
          <div class="title">
            <span>劳动力就业服务平台</span>
          </div>
          <div class="title-content">
            <span>1000+万待就业劳动力等你选择</span>
          </div>
        </div>
        <div class="statement">客服热线:0857-242342342</div>
      </div>
      <div class="content-wrapper" v-loading="loading" @click="showMap(false)">
        <div class="content-main">
          <el-steps :active="activeStep" style="margin-top: 32px;" finish-status="success">
            <el-step title="填写企业基本信息"></el-step>
            <el-step title="完善企业信息"></el-step>
            <el-step title="注册完成"></el-step>
          </el-steps>
          <el-form :model="newOrg" ref="base" :rules="rules" label-width="140px" style="width: 578px; margin-top: 40px;">
            <div class="base-content" v-show="activeStep === 0">
              <el-form-item label="企业名称" prop="orgName">
                <el-input v-model="newOrg.orgName" placeholder="请输入企业名称"></el-input>
              </el-form-item>
              <el-form-item label="企业法人" prop="legalPerson">
                <el-input v-model="newOrg.legalPerson" placeholder="请输入企业法人"></el-input>
              </el-form-item>
              <el-form-item label="统一社会信用代码" prop="orgCode">
                <el-input v-model="newOrg.orgCode" placeholder="请输入统一社会信用代码"></el-input>
              </el-form-item>
            </div>
          </el-form>
          <el-form :model="newOrg" ref="detail" :rules="rules" label-width="140px" style="width: 578px; margin-top: 40px;">
            <div class="detail-content" v-show="activeStep === 1">
              <el-form-item label="企业所在地" prop="regAddress">
                <div @click="stopPropagation">
                  <el-input v-model="newOrg.regAddress" placeholder="请输入企业所在地" autosize @focus="showMap(true)"></el-input>
                  <el-collapse-transition>
                    <map-position v-show="showMapStatus" :width="mWidth" :height="mHeight" :showInfo="false" ref="mapComp" @adr="adr = $event" @adrCode="adrCode = $event" @adrPosition="adrPosition = $event"></map-position>
                  </el-collapse-transition>
                </div>
              </el-form-item>
              <el-form-item label="所属行业" prop="industry">
                <el-select @focus="showMap(false)" style="width:438px;" v-model="newOrg.industry" placeholder="请选择行业">
                  <el-option v-for="item in industryOpt" :key="item.value" :label="item.label" :value="item.label">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="企业规模" prop="personScale">
                <el-select @focus="showMap(false)" style="width:438px;" value-key="label" v-model="newOrg.personScale" placeholder="请选择企业规模">
                  <el-option v-for="item in personScaleOpt" :key="item.value" :label="item.label" :value="item">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="企业类型" prop="orgType">
                <el-select @focus="showMap(false)" style="width:438px;" v-model="newOrg.orgType" placeholder="请选择企业类型">
                  <el-option v-for="item in orgTypeOpt" :key="item.value" :label="item.label" :value="item.label">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="企业联系人" prop="contactPerson">
                <el-input v-model="newOrg.contactPerson" placeholder="请输入企业联系人"></el-input>
              </el-form-item>
              <el-form-item label="联系电话" prop="contactPhone">
                <el-input v-model="newOrg.contactPhone" placeholder="请输入联系电话"></el-input>
              </el-form-item>
              <el-form-item label="验证码" prop="valiCode">
                <el-input v-model="newOrg.valiCode" auto-complete="off" placeholder="请输入验证码">
                  <template slot="append">
                    <span @click="handleSend" class="msg-text" :style="msgKey ? 'cursor: wait;' : 'cursor: pointer;'" style="-webkit-user-select: none; user-select: none;">{{activeMsgText}}</span>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="营业执照" prop="license">
                <div class="pic-layout">
                  <up-load ref="upLoad" bucketUrl='tmp/license/' :bySTS='false' :isAdd="false" @hasPic="hasPic = $event"></up-load>
                </div>
              </el-form-item>
              <div class="check-statement">
                <el-checkbox v-model="liabilityStatus" />
                <span style="font-size: 12px;font-weight:400; color:rgba(0,0,0,0.45); line-height:22px;">
                  我已阅读并同意人和数据招聘
                  <span class="back-login-btn" @click="showDialog('免责声明')">《免责声明》</span>
                  和
                  <span class="back-login-btn" @click="showDialog('岗位发布声明')">《岗位发布声明》</span>
                </span>
              </div>
            </div>
          </el-form>
          <div class="complete-content" v-show="activeStep === 2">
            <img :src="successIcon">
            <p class="complete-title">企业账号注册成功</p>
            <p class="complete-container">您可以使用手机号+验证码进行登录</p>
          </div>
          <center>
            <el-button v-if="activeStep !== 2" :disabled="!liabilityStatus" type="primary" @click="nextStep" style="width:102px; height:32px; line-height: 32px; padding: 0;">{{stepValue}}</el-button>
            <el-button v-else type="primary" @click="toLogin">去登陆</el-button>
            <span v-if="activeStep === 0" style="font-size: 12px;font-weight:400; color:rgba(0,0,0,0.45); line-height:22px;">已有账号,
              <span class="back-login-btn" @click="backToLogin">去登录</span>
            </span>
            <el-button v-if="activeStep === 1" @click="backToBase">返回上一步</el-button>
          </center>
        </div>
      </div>
      <el-dialog class="statement-dialog-wrapper" :title="title" :visible.sync="showStatement" width="620px">
        <span v-if="title === '免责声明'" class="statement-pages" v-html="statementInfo"></span>
        <span v-else class="statement-pages" v-html="offerPublicInfo"></span>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import * as g from '@/projects/menu/graphql/auth.gql'
import * as o from '@/projects/menu/graphql/org.gql'
import UpLoad from '@/projects/menu/views/components/UpLoad.vue'
import MapPosition from '@/projects/menu/views/components/MapPosition.vue'
import regIcon from '@/projects/menu/assets/register_title.png'
import successIcon from '@/projects/menu/assets/icon_success.png'
import { statement, offerPublic } from './statement'

const MSGINIT = '发送验证码'
const MSGERROR = '验证码发送失败'
const MSGSCUCCESS = '#{time}秒后重发'
const MSGTIME = 120
@Component({
  components: {
    UpLoad,
    MapPosition
  }
})
export default class Register extends Vue {
  private newOrg: any
  private loading!: boolean
  private msgKey!: boolean
  private showMapStatus!: boolean
  private liabilityStatus!: boolean
  private showStatement!: boolean
  private activeStep!: number
  private stepValue!: string
  private title!: string
  private activeMsgText!: string
  private msgTime: any
  private $apollo: any
  private $apolloProvider: any
  private $message: any
  private $router: any
  public data() {
    const checkChinese = (rule: any, value: string, callback: (arg?: Error) => any) => {
      if (!/[\u4e00-\u9fa5]{2,30}/gm.test(value)) {
        return callback(new Error('请包含至少两个中文字符'))
      } else if (!/^([\u4E00-\u9FA5A-Za-z0-9_]{2,30})$/.test(value)) {
        return callback(new Error('不能含有特殊字符'))
      } else {
        callback()
      }
    }
    const checkLicense = (rule: any, value: string, callback: (arg?: Error) => any) => {
      if ((this as any).$refs.upLoad.files.randomName === undefined) {
        return callback(new Error('请上传营业执照'))
      } else {
        callback()
      }
    }
    const checkName = async (rule: any, value: string, callback: (arg?: Error) => any) => {
      if (value === '') { return callback(new Error('请输入企业名称')) }
      if (!/[\u4e00-\u9fa5]{2,30}/gm.test(value)) { return callback(new Error('请包含至少两个中文字符')) }
      if (!/^([\u4E00-\u9FA5A-Za-z0-9_]{2,30})$/.test(value)) { return callback(new Error('不能含有特殊字符')) }
      if (value !== '') {
        const { data } = await this.$apollo.query({
          query: g.existCodeOrName,
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
      }
    }
    const checkOrgCode = async (rule: any, value: string, callback: (arg?: Error) => any) => {
      if (value === '') { return callback(new Error('请输入统一社会信用代码')) }
      if (!(/^[A-Za-z0-9]{18}$/.test(value))) { return callback(new Error('请输入18位统一社会信用代码')) }
      if (value !== '') {
        const { data } = await this.$apollo.query({
          query: g.existCodeOrName,
          variables: {
            orgCode: value
          },
          fetchPolicy: 'network-only'
        })
        if (data.existOrgCodeOrOrgNameByToken) {
          return callback(new Error('统一社会信用代码已存在'))
        } else {
          return callback()
        }
      }
    }
    return {
      // ?免责声明
      statementInfo: statement,
      offerPublicInfo: offerPublic,
      // ? 验证码
      msgTime: MSGTIME,
      msgKey: false,
      activeMsgText: MSGINIT,
      // ? 地图宽高
      mWidth: '450px',
      mHeight: '300px',
      activeStep: 0,
      liabilityStatus: true,
      showMapStatus: false,
      showStatement: false,
      loading: false,
      regIcon,
      successIcon,
      title: '',
      stepValue: '下一步',
      adr: '',
      adrCode: '',
      adrPosition: '',
      newOrg: {
        valiCode: '',
        orgName: '',
        regAddress: '',
        regAddressCode: '',
        postalLonLat: '',
        industry: '',
        personScale: '',
        orgType: '',
        legalPerson: '',
        contactPerson: '',
        contactPhone: '',
        orgCode: ''
      },
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
        ],
        valiCode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { pattern: /^\d{6}$/, message: '请输入正确的验证码', trigger: 'blur' }
        ],
        orgCode: [
          { required: true, validator: checkOrgCode, trigger: 'blur' }
        ],
        license: [
          { required: true, validator: checkLicense }
        ]
      }
    }
  }
  public mounted() {
    console.log('haha')
  }
  public stopPropagation(e: any) {
    e.stopPropagation()
  }
  public showMap(bool: boolean) {
        this.showMapStatus = bool
  }
  public nextStep() {
      if (this.activeStep === 0) {
        (this as any).$refs.base.validate((params: boolean) => {
          if (params) {
            this.liabilityStatus = false
            this.stepValue = '提交'
            if (this.activeStep > 2) {
              this.activeStep = 0
            } else {
              this.activeStep++
            }
          }
        })
      } else if (this.activeStep === 1) {
        (this as any).$refs.detail.validate(async (params: boolean) => {
          if (params) {
            if (await this.validPhoneNum()) {
              await this.submitForm()
              if (this.activeStep > 2) {
                this.activeStep = 0
              } else {
                this.activeStep++
              }
            } else {
              this.$message({
                message: '手机验证码错误,请重试!',
                type: 'warning'
              })
            }
          }
        })
      }
    }
public async validPhoneNum() {
      try {
        const { data } = await this.$apollo.query({
          query: g.existVerifyCodeByMobileNo,
          variables: {
            mobileNo: this.newOrg.contactPhone,
            verifyCode: this.newOrg.valiCode
          }
        })
        return data.existVerifyCodeByMobileNo
      } catch (error) {
        this.$message({
          message: '请求错误',
          type: 'error'
        })
        console.error(error)
      }
    }
public backToBase() {
      this.activeStep--
      this.liabilityStatus = true
      this.stepValue = '下一步'
    }
public showDialog(title: string) {
      this.showStatement = true
      this.title = title
    }
public backToLogin() {
      // this.$router.push('/login')
      this.$router.go(-1)
    }
public async submitForm() {
      this.loading = true
      delete this.newOrg.valiCode
      this.newOrg.personScale = JSON.stringify(this.newOrg.personScale)
      await (this as any).$refs.upLoad.upLoadFile()
      this.newOrg.licensePicUrls = (this as any).$refs.upLoad.urls
      this.loading = false
      // console.log(this.newOrg)
      try {
        const { data } = await this.$apolloProvider.clients.org.mutate({
          mutation: o.newOrgByCoMe,
          variables: {
            orgEditByCoBo: this.newOrg
          }
        })
        // console.log(data.newOrgByCoMe)
      } catch (error) {
        this.$message({
          message: '提交错误!',
          type: 'error'
        })
      }
    }
public toLogin() {
      this.$router.push('/login')
    }
public async handleSend() {
      if (this.newOrg.contactPhone === '' || !(/^\d{11}$/.test(this.newOrg.contactPhone))) {
        (this as any).$refs.detail.validateField('contactPhone')
        return
      }
      if (this.activeMsgText !== '发送验证码') { return }
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
        const verifyCode = await this.$apollo
          .mutate({
            mutation: g.newVerifyCodeByMobileNo,
            variables: {
              mobileNo: this.newOrg.contactPhone
            }
          })
      } catch (error) {
        console.error(error)
        throw new Error(`mutation--newVerifyCodeByMobileNo-->${error}`)
      }
    }
    // 监听子组件上传图片验证
  @Watch('hasPic')
  private wHasPic() {
    (this as any).$refs.form.validate(async (vaild: any) => {
      console.log('vaild', vaild)
    })
  }
    // 监听子组件详细地址
  @Watch('adr')
  private wAdr(e: any) {
    this.newOrg.regAddress = e
  }
  @Watch('adrCode')
  private wAdrCode(e: any) {
    this.newOrg.regAddressCode = e
  }
  @Watch('adrPosition')
  private wAdrPostion(e: any) {
    this.newOrg.postalLonLat = e
  }
}
</script>

<style lang="scss" scoped>
//宽高
@mixin wh($width, $height) {
  width: $width;
  height: $height;
}
.god-wrapper {
  @include wh(100%, 100%);
  background-color: #f0f2f5 !important;
}
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f0f2f5 !important;
}
.top-wrapper {
  margin: {
    top: 54px;
    bottom: 24px;
  }
  @include wh(900px, 120px);
  display: flex;
  flex-direction: row;
  img {
    margin: {
      left: 147px;
    }
  }
}
.title-wrapper {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  .title {
    width: 216px;
    height: 24px;
    padding-top: 64px;
    span {
      font-size: 24px;
      font-family: PingFangSC-Medium;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.85);
      line-height: 24px;
    }
  }
  .title-content {
    width: 235px;
    height: 24px;
    font-size: 16px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 24px;
  }
}
.statement {
  margin: {
    top: 96px;
    left: 78px;
  }
  width: 152px;
  height: 24px;
  font-size: 12px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  line-height: 24px;
}
.content-wrapper {
  width: 900px;
  margin-bottom: 77px;
  background-color: #fff;
  .content-main {
    margin: 0 auto;
    margin-bottom: 95px;
    width: 608px;
  }
}
.check-statement {
  margin: {
    left: 138px;
    bottom: 16px;
  }
}
.back-login-btn {
  font-size: 12px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  color: #1890ff;
  line-height: 22px;
  cursor: pointer;
}
.complete-content {
  @include wh(220px, 240px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  img {
    @include wh(72px, 72px);
  }
  .complete-title {
    width: 192px;
    height: 32px;
    font-size: 24px;
    font-family: PingFangSC-Medium;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 32px;
  }
  .complete-container {
    width: 219px;
    height: 22px;
    font-size: 14px;
    font-family: PingFangSC-Regular;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.43);
    line-height: 22px;
  }
}
.statement-pages {
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  line-height: 22px;
}
</style>
<style lang="scss">
.el-step__head.is-process {
  border-color: #1890ff !important;
  color: #1890ff !important;
}
.el-step__title.is-process {
  @extend .el-step__head.is-process
}
.el-step__head.is-success {
  border-color: #1890ff !important;
  color: #1890ff !important;
}
.el-step__title.is-success {
  color: #1890ff !important;
}
.el-icon-check:before {
  color: #1890ff;
}
.god-wrapper {
  .el-input__inner {
    height: 32px;
    line-height: 32px;
  }
}

.el-dialog {
  margin-top: 54px !important;
}
.statement-dialog-wrapper .el-dialog .el-dialog__header {
  border-bottom: 1px solid #e9e9e9 !important;
  padding: 10px 20px 10px 20px !important;
  background-color: #fafafa;
}
.statement-dialog-wrapper .el-dialog .el-dialog__header span {
  font-size: 14px;
  color: #000000;
}
.statement-dialog-wrapper .el-dialog__body {
  padding: 42px 36px;
}
.statement-dialog-wrapper .el-form-item__label {
  width: 140px;
  text-align: right;
  color: #000000;
}
</style>
