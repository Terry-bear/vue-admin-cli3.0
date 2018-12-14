<template>
  <div>
    <back-btn :cancle="cancle"></back-btn>
    <div class="new-org-info-wrapper">
      <h3 style="margin-left: 24px;padding-top:16px;font-size: 16px;color:rgba(0,0,0,0.85);">添加企业</h3>
      <div style="height: 1px;background-color: rgba(233,233,233,1);margin-bottom: 15px"></div>
      <div v-loading="loading" style="padding-bottom: 30px">
        <center @click="showMap(false)">
          <el-form :model="detailObj" ref="form" :rules="rules" label-width="150px" style="width: 600px;">
            <el-form-item label="企业名称" prop="orgName">
              <el-input v-model="detailObj.orgName" placeholder="请输入企业名称"></el-input>
            </el-form-item>
            <el-form-item label="企业所在地" prop="regAddress">
              <div @click="stopPropagation">
                <el-input v-model="detailObj.regAddress" placeholder="请输入企业所在地" autosize @focus="showMap(true)"></el-input>
                <el-collapse-transition>
                  <map-position v-show="showMapStatus" :width="mWidth" :height="mHeight" :showInfo="false" ref="mapComp" @adr="adr = $event" @adrCode="adrCode = $event" @adrPosition="adrPosition = $event"></map-position>
                </el-collapse-transition>
              </div>
            </el-form-item>
            <el-form-item label="所属行业" prop="industry">
              <el-select @focus="showMap(false)" style="width:450px;" v-model="detailObj.industry" placeholder="请选择行业">
                <el-option v-for="item in industryOpt" :key="item.value" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="企业规模" prop="personScale">
              <el-select @focus="showMap(false)" style="width:450px;" value-key="label" v-model="detailObj.personScale" placeholder="请选择企业规模">
                <el-option v-for="item in personScaleOpt" :key="item.value" :label="item.label" :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="企业类型" prop="orgType">
              <el-select @focus="showMap(false)" style="width:450px;" v-model="detailObj.orgType" placeholder="请选择企业类型">
                <el-option v-for="item in orgTypeOpt" :key="item.value" :label="item.label" :value="item.label">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="企业法人" prop="legalPerson">
              <el-input v-model="detailObj.legalPerson" placeholder="请输入企业法人"></el-input>
            </el-form-item>
            <el-form-item label="企业联系人" prop="contactPerson">
              <el-input v-model="detailObj.contactPerson" placeholder="请输入企业联系人"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="detailObj.contactPhone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="企业邮箱">
              <el-input v-model="orgEmail" placeholder="请输入企业邮箱"></el-input>
            </el-form-item>
            <el-form-item label="企业网址">
              <el-input v-model="orgUrl" placeholder="请输入企业网址,格式www.gshbzw.com"></el-input>
            </el-form-item>
            <el-form-item label="统一社会信用代码" prop="orgCode">
              <el-input v-model="detailObj.orgCode" placeholder="请输入统一社会信用代码"></el-input>
            </el-form-item>
            <el-form-item label="负责专员" prop="operatorId">
              <el-select @focus="showMap(false)" style="width:450px;" value-key="label" v-model="detailObj.operatorId" placeholder="请选择指派专员">
                <el-option v-for="item in allProfessionalInfo" :key="item.commId" :label="item.name" :value="item.commId">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="营业执照" prop="license">
              <div class="pic-layout">
                <up-load ref="upLoad" :isAdd="false" @hasPic="hasPic = $event"></up-load>
              </div>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <center>
              <el-button type="primary" @click="submits()" size="small">确 定</el-button>
              <el-button @click="cancle()" size="small">返回</el-button>
            </center>
          </div>
        </center>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import { ShowObj } from '@/projects/menu/store-gql/actions/org-action.ts'
import UpLoad from '@/projects/menu/views/components/UpLoad.vue'
import * as o from 'api/org.gql'
import * as a from 'api/auth.gql'
import MapPosition from '@/projects/menu/views/components/MapPosition.vue'
import BackBtn from '@/components/BackBtn.vue'
@Component({
  components: {
    UpLoad,
    MapPosition,
    BackBtn
  }
})
export default class NewOrg extends mixins(ExtVue) {
  @Prop() private createStatus!: boolean
  private detailObj!: ShowObj
  private allProfessionalInfo!: any[]
  private adrPosition!: string
  private orgCode!: string
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
      if (this.$refs.upLoad.files.randomName === undefined) {
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
      }
    }
    const checkOrgCode = async (rule: any, value: string, callback: (arg?: Error) => any) => {
      if (value === '') { return callback(new Error('请输入统一社会信用代码')) }
      if (!(/^[A-Za-z0-9]{18}$/.test(value))) { return callback(new Error('请输入18位统一社会信用代码')) }
      if (value !== '') {
        const { data } = await this.$apollo.query({
          query: a.existCodeOrName,
          variables: {
            orgCode: value
          },
          fetchPolicy: 'network-only'
        })
        if (data.existOrgCodeOrOrgName) {
          return callback(new Error('统一社会信用代码已存在'))
        } else {
          return callback()
        }
      }
    }
    return {
      // ? 地图宽高
      mWidth: '450px',
      mHeight: '300px',
      adr: '',
      adrCode: '',
      adrPosition: '',
      hasPic: undefined, // 验证是否添加图片
      loading: false,
      showMapStatus: false,
      detailObj: {
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
      allProfessionalInfo: [],
      orgEmail: null,
      orgUrl: null,
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
        orgCode: [
          { required: true, validator: checkOrgCode, trigger: 'blur' }
        ],
        license: [
          { required: true, validator: checkLicense }
        ],
        operatorId: [
          { required: true, message: '请选择专员', trigger: 'change' }
        ]
      }
    }
  }
  public async mounted() {
  }
  public async created() {
    await this.getAllProfessionalInfo()
    console.log(this.allProfessionalInfo)
  }
  // 所有专员信息
  public async getAllProfessionalInfo() {
    try {
      const { data } = await this.$apollo.provider.clients.org.query({
        query: o.commissionerAllByCoBo,
        variables: {
          token: this.$store.state.menu.token
        }
      })
      const areaData = JSON.parse(JSON.stringify(data))
      this.allProfessionalInfo = areaData.commissionerAllByCoBo
    } catch (err) {
      this.allProfessionalInfo = []
    }
  }
  public stopPropagation(e: any) {
    e.stopPropagation()
  }
  public showMap(bool: boolean) {
    this.showMapStatus = bool
  }
  public cancle() {
    this.$emit('cancelStatus', false)
    this.$parent.$apollo.queries.orgByCoBo.refetch()
  }
  public submits() {
    this.loading = true
    if (this.$data.orgEmail !== null) {
      this.$data.detailObj.orgEmail = this.$data.orgEmail
    }
    if (this.$data.orgUrl !== null) {
      this.$data.detailObj.orgUrl = `https://${this.$data.orgUrl}`
    }
    this.$refs.form.validate(async (vaild: boolean) => {
      if (vaild) {
        // 序列化企业规模,利于排序
        const tempData = { ...this.$data.detailObj }
        tempData.personScale = JSON.stringify(tempData.personScale)
        tempData.postalLonLat = this.adrPosition
        try {
          const res = await this.$apollo.provider.clients.org.mutate({
            mutation: o.newOrgByCoBo,
            variables: {
              token: this.$store.state.menu.token,
              companyNo: '',
              orgEditByCoBo: tempData
            }
          })
          const adata = res.data.newOrgByCoBo
          this.orgCode = adata.orgCode
          await this.$refs.upLoad.upLoadFile()
          await this.upLiPicUrls()
          this.loading = false
        } catch (error) {
          this.loading = false
          console.log(JSON.parse(JSON.stringify(error)))
          let messageContent = '提交失败啦!!'
          if (JSON.parse(JSON.stringify(error)).message.includes('email')) {
            messageContent = '企业邮箱错误，请重新输入！'
          } else if (JSON.parse(JSON.stringify(error)).message.includes('url')) {
            messageContent = '企业网址错误，请重新输入！'
          } else if (JSON.parse(JSON.stringify(error)).message.includes('contactPhone')) {
            messageContent = '电话号码已存在，请重新输入！'
          }
          this.$message({
            message: messageContent,
            type: 'error'
          })
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
  /**
   * 提交后更新url地址
   */
  public async upLiPicUrls() {
    const urlArr = this.$refs.upLoad.urls
    const res = await this.$apollo.provider.clients.org.mutate({
      mutation: o.editOrgByCoBo,
      variables: {
        token: this.$store.state.menu.token,
        orgEditByCoBo: {
          orgCode: this.detailObj.orgCode,
          licensePicUrls: urlArr,
          operatorId: this.detailObj.operatorId
        },
        companyNo: ''
      }
    })
    const adata = res.data.editOrgByCoBo
    this.$message({
      message: '提交成功!!',
      type: 'success'
    })
    setTimeout(() => {
      this.loading = false
      this.$emit('cancelStatus', false)
      this.$parent.$apollo.queries.orgByCoBo.refetch()
    }, 250)
  }
  @Watch('hasPic')
  private wHasPic() {
    this.$refs.form.validate(async (vaild: any) => { })
  }
  @Watch('adr')
  private wAdr(e: any) {
    this.detailObj.regAddress = e
  }
  @Watch('adrCode')
  private wAdrCode(e: any) {
    this.detailObj.regAddressCode = e
  }
  @Watch('adrPosition')
  private wAdrPosition(e: any) {
    this.detailObj.postalLonLat = e
  }
}
</script>

<style lang="scss" scoped>
.new-org-info-wrapper{
  background-color: #fff;
  margin: {
    left: 24px;
    right: 24px;
  }
}
.pic-layout {
  display: flex;
  flex-direction: row;
}
</style>
