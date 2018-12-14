<template>
  <div>
    <keep-alive>
      <el-dialog class="org-show-detail-m" :title="title" :visible.sync="showDetailStatus" :before-close="cancleBtn" width="544px">
        <div v-loading="loading">
          <el-form :model="showObj" ref="form" label-position="left" :rules="rules" label-width="150px" style="width: 504px;">
            <el-form-item label="企业名称:" prop="orgName">
              <el-input v-model="showObj.orgName" :disabled="!isEdit" v-if="isEdit"></el-input>
              <span v-else>{{showObj.orgName}}</span>
            </el-form-item>
            <el-form-item label="企业所在地:" prop="regAddress">
              <div v-if="isEdit">
                <el-input v-model="showObj.regAddress" :disabled="!isEdit" type="textarea" autosize class="testarea-content" @focus="showMap(true)"></el-input>
                <el-collapse-transition>
                  <map-position v-show="isEdit&&showMapStatus" :width="mWidth" :height="mHeight" :showInfo="false" :isLocation="false" :defPosition="defPosition" ref="mapComp" @adrMsg="adrMsg = $event"></map-position>
                </el-collapse-transition>
              </div>
              <span v-else>{{showObj.regAddress}}</span>
            </el-form-item>
            <el-form-item label="所属行业:" prop="industry">
              <span v-if="!isEdit">{{showObj.industry}}</span>
              <el-select @focus="showMap(false)" v-model="showObj.industry" v-else>
                <el-option v-for="item in industryOpt" :key="item.value" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="企业规模:" prop="personScale">
              <span v-if="!isEdit">{{tempPersonScale}}</span>
              <el-select @focus="showMap(false)" v-model="tempPersonScale" value-key="label" v-else>
                <el-option v-for="item in personScaleOpt" :key="item.value" :label="item.label" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="企业类型:" prop="orgType">
              <span v-if="!isEdit">{{showObj.orgType}}</span>
              <el-select @focus="showMap(false)" v-model="showObj.orgType" v-else>
                <el-option v-for="item in orgTypeOpt" :key="item.value" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <div style="border-bottom: 1px solid #E9E9E9; margin-bottom: 15px;"></div>
            <el-form-item label="企业法人:" prop="legalPerson">
              <el-input v-model="showObj.legalPerson" :disabled="!isEdit" v-if="isEdit"></el-input>
              <span v-else>{{showObj.legalPerson}}</span>
            </el-form-item>
            <el-form-item label="企业联系人:" prop="contactPerson">
              <el-input v-model="showObj.contactPerson" :disabled="!isEdit" v-if="isEdit"></el-input>
              <span v-else>{{showObj.contactPerson}}</span>
            </el-form-item>
            <el-form-item label="联系电话:" prop="contactPhone">
              <el-input v-model="showObj.contactPhone" :disabled="!isEdit" v-if="isEdit"></el-input>
              <span v-else>{{showObj.contactPhone}}</span>
            </el-form-item>
            <el-form-item label="企业邮箱:">
              <el-input v-model="showObj.orgEmail" :disabled="!isEdit" v-if="isEdit"></el-input>
              <span v-else>{{showObj.orgEmail}}</span>
            </el-form-item>
            <el-form-item label="企业网址:">
              <el-input v-model="showObj.orgUrl" :disabled="!isEdit" v-if="isEdit"></el-input>
              <span v-else>{{showObj.orgUrl}}</span>
            </el-form-item>
            <div style="border-bottom: 1px solid #E9E9E9; margin-bottom: 15px;"></div>
            <el-form-item label="统一社会信用代码:">
              <el-input v-model="showObj.orgCode" :disabled="true" v-if="isEdit"></el-input>
              <span v-else>{{showObj.orgCode}}</span>
            </el-form-item>
             <el-form-item label="负责专员" prop="operatorId">
              <el-select @focus="showMap(false)" style="width:450px;" value-key="label" v-model="showObj.operatorId"  v-if="isEdit" placeholder="请选择指派专员">
                <el-option v-for="item in allProfessionalInfo" :key="item.commId" :label="item.name" :value="item.commId">
                </el-option>
              </el-select>
              <span v-else>{{showObj.operatorName}}</span>
            </el-form-item>
            <el-form-item label="营业执照:" prop="license">
              <div v-if="!isEdit">
                <label v-for="ite in strUrlsToArr" :key="ite.dex">
                  <img style="height: 102px; width: 150px" :src="ite">
                </label>
              </div>
              <div style="display:flex;flex-direction:row;" v-else>
                <label v-for="ite in strUrlsToArr" :key="ite.dex">
                  <up-load style="height: 102px; width: 150px" :picSrc="ite" :isAdd="false" ref="upLoad"></up-load>
                </label>
              </div>
            </el-form-item>
          </el-form>
          <div v-if="isEdit" slot="footer" class="dialog-footer org-edit-button-m">
            <el-button size="small" type="primary" @click="submits()">确 定</el-button>
          </div>
          <div v-else-if="showObj.orgStatus === 1 && authorControl === 'bo'" class="org-edit-button-m">
            <el-button size="small" type="primary" @click="changeEditState()">编 辑</el-button>
          </div>
        </div>
      </el-dialog>
    </keep-alive>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import UpLoad from '@/projects/menu/views/components/UpLoad.vue'
import * as o from 'api/org.gql'
import * as a from 'api/auth.gql'
import { ShowObj } from '@/projects/menu/store-gql/actions/org-action.ts'
import MapPosition from '@/projects/menu/views/components/MapPosition.vue'

@Component({
  components: {
    UpLoad,
    MapPosition
  }
})
export default class ShowDetail extends mixins(ExtVue) {
  @Prop() private detailObj: any
  @Prop() private showDetailStatus!: boolean
  @Prop() private isEdit!: boolean
  private authorControl!: string
  private thisOrgName!: string
  private showObj!: ShowObj
  private tempPersonScale!: string | object
  private allProfessionalInfo: any
  private defPosition: any
  private showMapStatus!: boolean
  private loading!: boolean
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
      if (value !== '' && value !== this.thisOrgName) {
        const { data } = await this.$apollo.query({
          query: a.existCodeOrName,
          variables: {
            orgName: value
          },
          fetchPolicy: 'network-only'
        })
        if (data.existOrgCodeOrOrgName) {
          return callback(new Error('企业名称已被注册'))
        } else {
          return callback()
        }
      } else {
        return callback()
      }
    }
    return {
      // ? 地图宽高
      mWidth: '350px',
      mHeight: '200px',
      adrMsg: {},
      defPosition: [106.630015, 26.64708],
      showMapStatus: false,
      loading: false,
      key: '',
      title: '企业详情',
      tempPersonScale: '',
      allProfessionalInfo: [],
      showObj: {},
      urls: '',
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
      authorControl: '',
      thisOrgName: '',
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
  public created() {
    // 权限获取和控制  bo--显示企业状态和编辑按钮   bo2--显示审核状态和审核按钮
    this.authorControl = this.$store.state.menu.tokenObj[this.$store.state.menu.tokenObj.def].split(/,/).filter((arg: any) => arg === 'bo')[0] || 'bo2'
  }
  private get strUrlsToArr(): any {
    return this.showObj.licensePicUrl ? JSON.parse(this.showObj.licensePicUrl) : ['']
  }
  public async submits() {
    await this.$refs.form.validate(async (vaild: boolean) => {
      if (vaild) {
        this.loading = true
        const showObj = JSON.parse(JSON.stringify(this.showObj))
        delete showObj.__typename
        delete showObj.licensePicUrl
        delete showObj.certifiedStatus
        delete showObj.orgStatus
        delete showObj.status
        if (showObj.orgEmail === null || showObj.orgEmail === '') { delete showObj.orgEmail }
        if (showObj.orgUrl === null || showObj.orgUrl === '') {
          delete showObj.orgUrl
        } else {
          const res = /https:\/\/(.+)/.test(showObj.orgUrl)
          showObj.orgUrl = res ? showObj.orgUrl : `https://${showObj.orgUrl}`
        }
        showObj.personScale = (typeof this.tempPersonScale === 'object') ? JSON.stringify(this.tempPersonScale) : showObj.personScale
        await this.$refs.upLoad[0].upLoadFile()
        if (this.$refs.upLoad[0].urls.length > 0) {
          showObj.licensePicUrls = this.$refs.upLoad[0].urls
          await this.$refs.upLoad[0].delFile(this.strUrlsToArr)
        } else {
          showObj.licensePicUrls = this.strUrlsToArr
        }
        delete showObj.orgNo
        delete showObj.operatorName
        try {
          const res = await this.$apollo.provider.clients.org.mutate({
            mutation: o.editOrgByCoBo,
            variables: {
              token: this.$store.state.menu.token,
              companyNo: '',
              orgEditByCoBo: showObj
            }
          })
          this.$message({
            message: '修改成功~',
            type: 'success'
          })
          setTimeout(() => {
            this.loading = false
            this.$emit('showDetailStatus', false)
            this.$parent.$apollo.queries.orgByCoBo.refresh()
          }, 250)
        } catch (error) {
          console.log(error)
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
          } else if (JSON.parse(JSON.stringify(error)).message.includes('contactPhone')) {
            this.$message({
              message: '电话号码已存在，请重新输入！',
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
        return false
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
  public cancleBtn() {
    this.$emit('showDetailStatus', false)
  }
  public showMap(bool: boolean) {
    this.showMapStatus = bool
  }
  public changeEditState() {
    this.$emit('changeEditState', true)
  }
  // 所有专员信息
  public async getAllProfessionalInfo() {
    try {
      const { data } = await this.$apollo.provider.clients.org.query({
        query: o.commissionerAllByCoBo,
        variables: {
          token: this.$store.state.menu.token
        },
        fetchPolicy: 'network-only'
      })
      const allData = JSON.parse(JSON.stringify(data))
      this.allProfessionalInfo = allData.commissionerAllByCoBo
    } catch (err) {
      this.allProfessionalInfo = []
    }
  }
  public operatorType(val: any) {
    for (const iter of this.allProfessionalInfo) {
      if (iter.commId === val) {
        return iter.name
      }
    }
    return ''
  }
  // 监听子组件详细地址
  @Watch('adrMsg')
  private wAdrMsg(e: any) {
    const { address, adcode, adrPosition } = e
    this.showObj.regAddress = address
    this.showObj.regAddressCode = adcode
    this.showObj.postalLonLat = adrPosition
  }
  @Watch('detailObj', {deep: true})
  private wDetailObj(e: any) {
    this.thisOrgName = e.orgName
    this.showObj = JSON.parse(JSON.stringify(e))
    this.showObj.postalLonLat !== null ? this.defPosition = JSON.parse(this.showObj.postalLonLat) : this.defPosition = this.defPosition
    this.tempPersonScale = this.showObj.personScale ? JSON.parse(this.showObj.personScale).label : this.showObj.personScale
  }
  @Watch('showDetailStatus')
  private wShowDetailStatus(e: any) {
    if (!e) {
      (this as any).$refs.form.resetFields()
    }
    if (e && this.isEdit && this.authorControl === 'bo') {
      (this as any).getAllProfessionalInfo()
    }
  }
}
</script>

<style lang="scss" scoped>
.el-input,
.el-select {
  height: 32px !important;
  width: 346px !important;
}
</style>

<style lang="scss">
.el-dialog {
  margin-top: 54px !important;
}
.org-show-detail-m .el-dialog .el-dialog__header {
  border-bottom: 1px solid #e9e9e9 !important;
  padding: 10px 20px 10px 20px !important;
  background-color: #fafafa;
}
.org-show-detail-m .el-dialog .el-dialog__header span {
  font-size: 14px;
  color: #000000;
}
.org-show-detail-m .el-dialog__body {
  padding: 20px 20px;
}
.org-show-detail-m .el-form-item__label {
  width: 140px;
  text-align: right;
  color: #000000;
}
.org-show-detail-m input {
  height: 32px;
}
.org-show-detail-m .el-form-item {
  margin-bottom: 18px;
}
.org-show-detail-m .el-textarea {
  width: 98%;
}
.org-show-detail-m .org-edit-button-m {
  margin-left: 150px;
}
</style>
