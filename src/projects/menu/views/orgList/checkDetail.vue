<template>
  <div>
    <back-btn :cancle="cancle"></back-btn>
    <div class="container">
      <el-card class="container-card" v-if="!isUpdate">
        <h3>更新资料</h3>
        <show-details :liTitle="liTitle">
          <span class="check-content" :style="diffObj.orgName ? `${color}` : ''" slot="orgName">{{checkData.orgName}}</span>
          <span class="check-content" :style="diffObj.regAddress ? `${color}` : ''" slot="regAddress">{{checkData.regAddress}}</span>
          <span class="check-content" :style="diffObj.industry ? `${color}` : ''" slot="industry">{{checkData.industry}}</span>
          <span class="check-content" :style="diffObj.personScale ? `${color}` : ''" slot="personScale">{{checkData.personScale}}</span>
          <span class="check-content" :style="diffObj.orgType ? `${color}` : ''" slot="orgType">{{checkData.orgType}}</span>
          <span class="check-content" :style="diffObj.legalPerson ? `${color}` : ''" slot="legalPerson">{{checkData.legalPerson}}</span>
          <span class="check-content" :style="diffObj.contactPerson ? `${color}` : ''" slot="contactPerson">{{checkData.contactPerson}}</span>
          <span class="check-content" :style="diffObj.contactPhone ? `${color}` : ''" slot="contactPhone">{{checkData.contactPhone}}</span>
          <span class="check-content" :style="diffObj.orgEmail ? `${color}` : ''" slot="orgEmail">{{checkData.orgEmail}}</span>
          <span class="check-content" :style="diffObj.orgUrl ? `${color}` : ''" slot="orgUrl">{{checkData.orgUrl}}</span>
          <span class="check-content" :style="diffObj.orgCode ? `${color}` : ''" slot="orgCode">{{checkData.orgCode}}</span>
          <!-- <div v-for="item in checkPicArr" :key="item.idx" slot="licensePicUrl">
            <img :src="item" style="width:150px; height:100px;">
          </div> -->
        </show-details>
      </el-card>
      <el-card class="container-card">
        <h3>原始资料</h3>
        <show-details :liTitle="liTitle">
          <span class="check-content" :style="diffObj.orgName ? `${color}` : ''" slot="orgName">{{orginData.orgName}}</span>
          <span class="check-content" :style="diffObj.regAddress ? `${color}` : ''" slot="regAddress">{{orginData.regAddress}}</span>
          <span class="check-content" :style="diffObj.industry ? `${color}` : ''" slot="industry">{{orginData.industry}}</span>
          <span class="check-content" :style="diffObj.personScale ? `${color}` : ''" slot="personScale">{{orginData.personScale}}</span>
          <span class="check-content" :style="diffObj.orgType ? `${color}` : ''" slot="orgType">{{orginData.orgType}}</span>
          <span class="check-content" :style="diffObj.legalPerson ? `${color}` : ''" slot="legalPerson">{{orginData.legalPerson}}</span>
          <span class="check-content" :style="diffObj.contactPerson ? `${color}` : ''" slot="contactPerson">{{orginData.contactPerson}}</span>
          <span class="check-content" :style="diffObj.contactPhone ? `${color}` : ''" slot="contactPhone">{{orginData.contactPhone}}</span>
          <span class="check-content" :style="diffObj.orgEmail ? `${color}` : ''" slot="orgEmail">{{orginData.orgEmail}}</span>
          <span class="check-content" :style="diffObj.orgUrl ? `${color}` : ''" slot="orgUrl">{{orginData.orgUrl}}</span>
          <span class="check-content" :style="diffObj.orgCode ? `${color}` : ''" slot="orgCode">{{orginData.orgCode}}</span>
          <!-- <div v-for="item in orginPicArr" :key="item.idx" slot="licensePicUrl">
            <img :src="item" style="width:150px; height:100px;">
          </div> -->
        </show-details>
      </el-card>
    </div>
    <div class="footer">
      <el-card class="box-card">
        <h3>审核意见</h3>
        <div class="check-wrapper">
          <div>
            <span class="check-wrapper-title">审核结果:</span>
            <el-radio v-model="checkStatus" :label=1>通 过</el-radio>
            <el-radio v-model="checkStatus" :label=0>驳 回</el-radio>
          </div>
          <div class="check-info-opt" v-show="checkStatus === 0">
            <span class="check-wrapper-title">审核意见:</span>
            <el-input class="info-textarea" type="textarea" :rows="5" v-model="opinion"></el-input>
          </div>
        </div>
      </el-card>
      <div class="foot-btn">
        <center>
          <el-button type="primary" @click="submits()">确 定</el-button>
          <el-button @click="cancle()">返回</el-button>
        </center>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import OssMixin from 'mixin/OssMixin'
import { CheckObj } from '@/projects/menu/store-gql/actions/org-action.ts'
import * as O from 'api/org.gql'
import BackBtn from '@/components/BackBtn.vue'
@Component({
    components: {
    BackBtn,
    showDetails: {
      props: ['liTitle'],
      template: `
      <div class="showDetails" style="width: 100%;height:100%; margin-left:32px;">
        <el-row :gutter="100">
          <el-col :span="150">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.orgName"></span>
            <slot name="orgName"></slot>
            </div>
          </el-col>
          <el-col :span="50">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.contactPerson"></span>
            <slot name="contactPerson"></slot>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="100">
          <el-col :span="150">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.regAddress"></span>
            <slot name="regAddress"></slot>
            </div>
          </el-col>
          <el-col :span="50">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.contactPhone"></span>
            <slot name="contactPhone"></slot>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="100">
          <el-col :span="150">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.industry"></span>
            <slot name="industry"></slot>
            </div>
          </el-col>
          <el-col :span="50">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.orgEmail"></span>
            <slot name="orgEmail"></slot>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="100">
          <el-col :span="150">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.personScale"></span>
            <slot name="personScale"></slot>
            </div>
          </el-col>
          <el-col :span="50">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.orgUrl"></span>
            <slot name="orgUrl"></slot>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="100">
          <el-col :span="150">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.orgType"></span>
            <slot name="orgType"></slot>
            </div>
          </el-col>
          <el-col :span="50">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.orgCode"></span>
            <slot name="orgCode"></slot>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="100">
          <el-col :span="150">
            <div class="grid-content bg-purple">
            <span class="check-title" v-html="liTitle.legalPerson"></span>
            <slot name="legalPerson"></slot>
            </div>
          </el-col>
        </el-row>
      </div>
      `
      // <el-col :span="50">
      //   <div class="grid-content bg-purple">
      //   <span class="check-title" v-html="liTitle.licensePicUrl"></span>
      //   <slot name="licensePicUrl"></slot>
      //   </div>
      // </el-col>
    }
  }
})
export default class CheckDetail extends mixins(ExtVue, OssMixin) {
  @Prop() private currentOrgCode: any
  private orginData!: CheckObj
  private checkData!: CheckObj
  private isUpdate!: boolean
  private diffObj!: any
  private checkStatus!: number
  private opinion!: string
  public data() {
    return {
      color: 'color:#F5222D;',
      liTitle: {
        orgName: '<font color="red" size=3>*&ensp;</font>企业名称：',
        regAddress: '<font color="red" size=3>*&ensp;</font>企业所在地: ',
        industry: '<font color="red" size=3>*&ensp;</font>所属行业: ',
        personScale: '<font color="red" size=3>*&ensp;</font>企业规模: ',
        orgType: '<font color="red" size=3>*&ensp;</font>企业类型: ',
        legalPerson: '<font color="red" size=3>*&ensp;</font>企业法人: ',
        contactPerson: '<font color="red" size=3>*&ensp;</font>企业联系人: ',
        contactPhone: '<font color="red" size=3>*&ensp;</font>联系电话: ',
        orgEmail: '&ensp;  企业邮箱: ',
        orgUrl: '&ensp;  企业网址: ',
        orgCode: '<font color="red" size=3>*&ensp;</font>纳税识别号: ',
        licensePicUrl: '<font color="red" size=3>*&ensp;</font>营业执照: '
      },
      checkData: {
        orgName: '',
        regAddress: '',
        industry: '',
        personScale: '',
        orgType: '',
        legalPerson: '',
        contactPerson: ' ',
        contactPhone: '',
        orgEmail: '',
        orgUrl: '',
        orgCode: '',
        licensePicUrl: ''
      },
      orginData: {
        orgName: '',
        regAddress: '',
        industry: '',
        personScale: '',
        orgType: '',
        legalPerson: '',
        contactPerson: ' ',
        contactPhone: '',
        orgEmail: '',
        orgUrl: '',
        orgCode: '',
        licensePicUrl: ''
      },
      diffObj: {},
      opinion: '',
      checkStatus: 1,
      isUpdate: false,
      loading: false,
      client: {}
    }
  }

  private get orginPicArr(): string {
    return (this.orginData.licensePicUrl !== '' && this.orginData.licensePicUrl !== null) ? JSON.parse(this.orginData.licensePicUrl) : ''
  }
  private get checkPicArr(): string {
    return (this.checkData.licensePicUrl !== '' && this.checkData.licensePicUrl !== null) ? JSON.parse(this.checkData.licensePicUrl) : ''
  }
  public mounted() {
    this.showData()
  }
  public async showData() {
    const res = await this.$apollo.provider.clients.org.query({
      query: O.orgByCoBoById,
      variables: {
        token: this.$store.state.menu.token,
        orgCode: this.currentOrgCode
      },
      fetchPolicy: 'network-only'
    })
    // console.log('审核页面数据', res.data.orgByCoBoById)
    if (res.data.orgByCoBoById.newestOrg !== null && res.data.orgByCoBoById.newestOrg !== '') {
      const { orgName, regAddress, industry, personScale, orgType, legalPerson, contactPerson, contactPhone, orgEmail, orgUrl, orgCode, licensePicUrl }: CheckObj = res.data.orgByCoBoById.newestOrg
      this.checkData = {
        orgName,
        regAddress,
        industry,
        orgType,
        legalPerson,
        contactPerson,
        contactPhone,
        orgEmail,
        orgUrl,
        orgCode,
        licensePicUrl
      }
      personScale !== null && personScale !== undefined
        ? this.checkData.personScale = JSON.parse(personScale).label
        : this.checkData.personScale = personScale
    } else {
      this.isUpdate = true
    }
    const { orgNo, orgName, regAddress, industry, personScale, orgType, legalPerson, contactPerson, contactPhone, orgEmail, orgUrl, orgCode, licensePicUrl } = res.data.orgByCoBoById
    this.orginData = {
      orgName,
      regAddress,
      industry,
      orgType,
      legalPerson,
      contactPerson,
      contactPhone,
      orgEmail,
      orgUrl,
      orgCode,
      licensePicUrl
    }
    personScale !== null && personScale !== undefined
      ? this.orginData.personScale = JSON.parse(personScale).label
      : this.orginData.personScale = personScale
    // console.log('orginData', this.orginData)
    if (!this.isUpdate) {
      this.diffObj = this.compareStatus(this.checkData, this.orginData)
    } else {
      this.copyFile(this.orginData.licensePicUrl, `/org/license/${orgNo}/`, orgNo)
    }
    console.log(this.diffObj)
    // console.log(this.orginData)
    // console.log(this.checkData)
  }
  public cancle() {
    this.$emit('cancelStatus', false)
  }
  public async submits() {
    if (this.opinion === '' && this.checkStatus === 0) {
      this.$message({
        message: '请填写审核意见',
        type: 'warning'
      })
      return
    }
    try {
      const res = await this.$apollo.provider.clients.org.mutate({
        mutation: O.auditOrgByCoBo,
        variables: {
          token: this.$store.state.menu.token,
          orgCode: this.currentOrgCode,
          certifiedStatus: this.checkStatus,
          certifiedFeedback: this.opinion
        }
      })
      const adata = res.data.auditOrgByCoBo
      this.$message({
        message: '提交成功~!',
        type: 'success'
      })
      setTimeout(() => {
        this.$emit('cancelStatus', false)
        this.$parent.$apollo.queries.orgByCoBo.refetch()
      }, 250)
    } catch (error) {
      this.$message({
        message: '提交失败了~',
        type: 'error'
      })
    }
  }
  /**
   * 不同属性进行回显
   */
  public compareStatus(obj1: any, obj2: any) {
    const diff: any = {}
    for (const k1 in obj1) {
      if (obj1.hasOwnProperty(k1)) {
        const ele1 = obj1[k1]
        for (const k2 in obj2) {
          if (obj2.hasOwnProperty(k2)) {
            const ele2 = obj2[k2]
            if (k1 === k2) {
              ele1 === ele2 ? diff[k1] = false : diff[k1] = true
            }
          }
        }
      }
    }
    return diff
  }
}
</script>

<style lang="scss" scoped>
@mixin fontStyle {
  font-size: 14px;
  font-family: PingFangSC-Regular;
  font-weight: 400;
}
@mixin titleFont {
  @include fontStyle;
  color: rgba(245, 34, 45, 0.85);
}
@mixin contentFont {
  @include fontStyle;
  color: rgba(0, 0, 0, 0.65);
}
.check-title {
  @include titleFont;
}
.check-content {
  @include contentFont;
  display: inline-block;
  height: 22px;
  width: 350px;
}
</style>

<style lang="scss">
.showDetails [class*='el-col-'] {
  padding-bottom: 16px;
}
.container {
  display: flex;
  flex-direction: row;
  margin: {
    left: 3%;
    right: 3%;
  }
  .detail-list-show > li {
    list-style: none;
    padding: {
      bottom: 6.5%;
    }
  }
  .container-card {
    margin: 2% 2px;
    width: 100%;
  }
}
.check-wrapper {
  padding: {
    left: 5%;
  }
  .check-wrapper-title {
    width: 70px;
    margin: {
      right: 25px;
    }
  }
}
.check-info-opt {
  display: flex;
  flex-direction: row;
  margin: {
    top: 10px;
  }
  .info-textarea {
    width: 450px;
    height: 110px;
  }
}
.footer {
  padding-bottom: 10%;
  margin: 0 3%;
  .foot-btn {
    margin: 10px 0;
  }
}
</style>
