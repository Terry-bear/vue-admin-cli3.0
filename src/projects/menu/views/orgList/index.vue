<template>
  <div class="app-container">
    <div v-if="staffShow" class="browser-navigation-hidden">
      <div class="calendar-list-container" v-if="!createStatus">
        <div class="filter-container">
          <span style="font-size: 14px;">企业名称:</span>
          <el-input class="filter-item" placeholder="请输入" size="mini" v-model="listQuery.username">
          </el-input>
          <span style="font-size: 14px;margin-left:30px;">企业状态: </span>
          <el-select v-model="value" placeholder="请选择" size="mini">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
          <el-button class="filter-item" size="small" type="primary" icon="search" @click="searchFilter" style="margin-left:30px;">查询</el-button>
          <el-button class="filter-item" size="small" @click="resetBtn" icon="edit">重置</el-button>
          <el-button v-if="authorControl === 'bo'" size="small" class="filter-item" type="primary" icon="search" @click="createComp">+ &nbsp;&nbsp;新增</el-button>
        </div>
        <el-table :data="list" v-loading="$apollo.loading" element-loading-text="给我一点时间" :max-height="maxHeight" fit highlight-current-row style="width: 96%">
          <el-table-column type="selection" width="35">
          </el-table-column>
          <el-table-column :label="COMPANY" prop="orgName" min-width="15%">
            <template slot-scope="{row}">
              <el-popover placement="top-start" width="250" trigger="hover" :content="row.orgName" v-if="row.orgName.length > 10">
                <span slot="reference" v-html="fmtData(row.orgName, listQuery.username)"></span>
              </el-popover>
              <span slot="reference" v-html="fmtData(row.orgName, listQuery.username)" v-else></span>
            </template>
          </el-table-column>
          <el-table-column :label="INDUSTRY" prop="industry" min-width="15%">
          </el-table-column>
          <el-table-column :label="COMPANYTYPE" prop="orgType" min-width="15%">
          </el-table-column>
          <el-table-column :label="COMPANYSTATUS" prop="orgStatus" min-width="15%">
            <template slot-scope="scope">
              <span>{{scope.row.orgStatus | fOrgStatus}}</span>
              <el-switch v-model="switchButtonIndex[scope.$index]" v-if="authorControl === 'bo'" active-color="#3F9EFF" inactive-color="#ff4949" @change="changeSwithState(scope.$index, scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column :label="REVIEWSTATUS" prop="certifiedStatus" min-width="15%">
            <template slot-scope="{row}">
              <span v-html="CerStatusIcon(row.certifiedStatus)"></span>
              <el-tooltip effect="light" placement="top" class="hover-show-content" :manual="row.certifiedStatus === 0 ? false : true" :content="row.certifiedFeedback">
                <span>{{row.certifiedStatus | fCerStatus}}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column :label="BUSINESSSCALE" sortable prop="personScale" min-width="15%">
            <template slot-scope="{row}">
              <span>{{row.personScale | fPersonScale}}</span>
            </template>
          </el-table-column>
           <el-table-column label="负责专员" min-width="15%">
            <template slot-scope="{row}">
              <span>{{row.operatorName}}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" :label="OPTS" min-width="25%">
            <template slot-scope="scope">
              <el-button size="medium" type="text" @click="open(scope.row)" :disabled="scope.row.orgStatus === 1 ? false : true">员工信息
              </el-button>
              <vertical></vertical>
              <el-button size="medium" type="text" @click="handleShowDetail(scope.row)">查看
              </el-button>
              <vertical></vertical>
              <el-button :disabled="scope.row.orgStatus === 1 ? false : true" v-if="authorControl === 'bo'" size="medium" type="text" @click="handleEditDetail(scope.row)">编辑
              </el-button>
              <el-button v-else type="text" size="medium" @click="handleCheckDetail(scope.row)" :disabled="scope.row.certifiedStatus === 1">审核
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-show="!$apollo.loading" class="pagination-container">
          <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>

    </div>
    <new-org class="orglist-placeholder-class" v-if="createStatus&&authorControl === 'bo'" :createStatus="createStatus" @cancelStatus="createStatus = $event"></new-org>
    <check-detail v-if="createStatus&&authorControl === 'bo2'" @cancelStatus="createStatus = $event" :currentOrgCode="currentOrgCode"></check-detail>
    <show-detail class="orglist-placeholder-class" :isEdit="isEdit" @changeEditState="changeEditState" :detailObj="detailObj" :showDetailStatus="showDetailStatus" @showDetailStatus="showDetailStatus = $event" ref="showDetail"></show-detail>
    <staff-crud v-if="!staffShow" :message="orgCode"></staff-crud>
  </div>
</template>

<style lang="scss" scoped>
/// ---
.filter-container {
  .el-input {
    height: 28px;
    width: 272px;
  }
}
.el-input .el-input__inner {
  height: 32px !important;
  line-height: 32px !important;
}
// ------------
.demo-table-expand {
  font-size: 0;
}
.demo-table-expand label {
  color: #99a9bf;
}
.demo-table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 33.333333%;
}

.orglist-placeholder-class .el-form-item__content .el-input__inner {
  border: 1px solid rgba(0, 0, 0, 0.15);
  height: 32px !important;
  line-height: 32px !important;
}

.orglist-placeholder-class .el-dialog {
  margin-top: 10px !important;
  margin-bottom: 10px !important;
  min-height: 450px;
  .el-dialog__body {
    padding-top: 10px;
    padding-bottom: 10px;
    .el-form-item__label {
      text-align: right;
    }
  }
  .el-dialog__header {
    background-color: rgba(250, 250, 250, 1) !important;
    border-bottom: 1px solid rgba(233, 233, 233, 1);
    padding: 10px 20px 10px !important;
    .el-dialog__title {
      font-size: 14px !important;
      color: #000;
      font-weight: bold;
    }
  }
}

.orglist-placeholder-class
  .el-form-item__content
  .el-input.is-disabled
  .el-input__inner {
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  color: #606266;
  cursor: default;
}
.orglist-placeholder-class .el-form {
  .el-form-item {
    margin-bottom: 15px;
    /*height: 32px;*/
  }
}

.orglist-placeholder-class .el-form-item.is-success .el-input__inner {
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.orglist-placeholder-class .el-form-item.is-error .el-input__inner {
  border-color: #f56c6c;
}

.orglist-placeholder-class .el-form-item__content .el-card {
  background-color: #fff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #606266;
}
.testarea-content {
  width: 350px !important;
}
.testarea-content textarea {
  background-color: #fff !important;
  color: #606266 !important;
  resize: none;
  cursor: default !important;
  border: 1px solid rgba(0, 0, 0, 0.15) !important;
  font-family: 'SimHeie';
}

.hover-show-content {
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

// .el-tooltip__popper, .is-light {
//   max-width: 250px;
//   line-height: 18px;
// }
</style>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import TableMixin from 'mixin/TableMixin'
import ExtVue from 'mixin/ExtVue'
import '@/projects/menu/assets/scss/rh_table.scss'
import OpenMessage from '@/utils/Message.ts'
import showDetail from './showDetail.vue'
import newOrg from './newOrg.vue'
import staffCrud from '../orgList/staffCRUD.vue'
import checkDetail from './checkDetail.vue'
import SearchPro from '@/utils/SearchPro.ts'
import * as g from 'api/org.gql'
import * as label from '@/projects/menu/assets/js/label-type.ts'
@Component({
  components: {
    showDetail,
    newOrg,
    checkDetail,
    staffCrud
  },
  apollo: {
    $client: 'org',
    $loadingKey: 'loading',
    orgByCoBo() {
      return {
        query: g.orgByCoBo,
        variables() {
          return {
            token: this.$store.state.menu.token,
            pageNo: this.listQuery.page,
            pageSize: this.listQuery.limit,
            orgName: this.orgName,
            status: this.orgStatuss
          }
        },
        // manual: true,
        // Polling
        // pollInterval: 3000, // ms
        result({ data, loading }) {
          // this.updateCount ++
          if (!loading) {
            this.$data.list = []
            if (data.orgByCoBo !== undefined) {
              this.fCompanyStatus(data.orgByCoBo.pageRows)
              this.$data.list = data.orgByCoBo.pageRows
              this.pageTotalCount = data.orgByCoBo.pageTotalCount
              this.pageTotalRows = data.orgByCoBo.pageTotalRows
              this.isLoading(false)
            }
          }
        },
        error(error) {
          console.log('---------', JSON.parse(JSON.stringify(error)).graphQLErrors[0].gerrType)
          if (JSON.parse(JSON.stringify(error)).graphQLErrors[0].gerrType === 'NotFound') {
            this.list = []
          } else {
            this.$message({
              message: '请求数据失败了',
              type: 'error'
            })
          }
          this.pageTotalCount = 0
          this.pageTotalRows = 0
          this.isLoading(false)
        },
        fetchPolicy: 'network-only'
      }
    }
  },
  filters: {
    fOrgStatus(arg: any) {
      arg = arg.toString()
      const enumOrgStatus = [{
        value: '1',
        label: '启用'
      },
      {
        value: '-1',
        label: '停用'
      }]
      enumOrgStatus.filter((obj) => {
        if (obj.value === arg) {
          arg = obj.label
        }
      })
      return arg
    },
    fCerStatus(arg: any) {
      arg = arg.toString()
      const enumCertifiedStatus = [{
        value: '1',
        label: '审核通过'
      }, {
        value: '0',
        label: '审核失败'
      }, {
        value: '-1',
        label: '注册审核'
      }, {
        value: '-2',
        label: '变更审核'
      }]
      enumCertifiedStatus.filter((obj) => {
        if (obj.value === arg) {
          arg = obj.label
        }
      })
      return arg
    }
  }
})
export default class Index extends mixins(TableMixin, ExtVue) {
  private total!: number
  private authorControl!: string
  private list: any
  private orgStatuss: any
  private value: any
  private orgName!: string | null
  private createStatus!: boolean
  private isEdit!: boolean
  private showDetailStatus!: boolean
  private detailObj: any
  private currentOrgCode!: string
  private switchButtonIndex!: any[]
  private orgCode!: string
  private staffShow!: boolean
  private allPerson!: any[]
  public data() {
    return {
      loading: false,
      staffShow: true,
      COMPANY: label.TO_COMPANYNAME,
      INDUSTRY: label.BO_INDUSTRY,
      COMPANYTYPE: label.BO_COMPANYTYPE,
      COMPANYSTATUS: label.BO_COMPANYSTATUS,
      REVIEWSTATUS: label.BO_REVIEWSTATUS,
      BUSINESSSCALE: label.BO_BUSINESSSCALE,
      OPTS: label.TO_OPT,
      maxHeight: 1,
      passwordType: 'password',
      list: null,
      total: 0,
      detailObj: {},
      isDisable: true,
      isCertifiedStatus: false,
      defaultStatus: 0,
      pageTotalRows: null,
      pageTotalCount: null,
      listQuery: {
        page: 1,
        limit: 20
      },
      options: [{
        value: '1',
        label: '启用'
      }, {
        value: '-1',
        label: '停用'
      }],
      orgStatuss: null,
      orgName: '',
      value: '',
      createStatus: false,
      showDetailStatus: false,
      isEdit: false,
      authorControl: '',
      switchState: true,
      switchButtonIndex: [],
      allPerson: []
    }
  }
  public created() {
    this.isLoading(true)
    // 权限获取和控制  bo--显示企业状态和编辑按钮   bo2--显示审核状态和审核按钮
    this.authorControl = this.$store.state.menu.tokenObj[this.$store.state.menu.tokenObj.def].split(/,/).filter((arg: any) => arg === 'bo')[0] || 'bo2'
  }
  // 搜索高亮
  public fmtData(val: any, key: string) {
    if (typeof val === 'string' && val.length > 10 - 1) {
      val = val.substring(0, 10) + '...'
    }
    const searchPro = new SearchPro(this.list, key)
    return searchPro.fmtData(val)
  }
  /**
   * 重置resetBtn
   */
  public resetBtn() {
    this.orgStatuss = this.value = null
    this.orgName = this.listQuery.username = null
    this.listQuery.page = 1
    this.$apollo.queries.orgByCoBo.refetch()
  }
  /**
   * 查询click
   */
  public async searchFilter() {
    this.orgName = this.listQuery.username ? this.listQuery.username : ``
    this.orgStatuss = this.value ? this.value : null
    // ! 点击查询时默认查第一页
    this.listQuery.page = 1
    this.$apollo.queries.orgByCoBo.refetch()
  }
  public CerStatusIcon(arg: any) {
    arg = arg.toString()
    const enumCertifiedStatus = [{
      value: '1',
      label: '<font color="#24A860" size=3>● </font>'
    }, {
      value: '0',
      label: '<font color="#F5222D" size=3>● </font>'
    }, {
      value: '-1',
      label: '<font color="#F5A623" size=3>● </font>'
    }, {
      value: '-2',
      label: '<font color="#007EEF" size=3>● </font>'
    }]
    enumCertifiedStatus.filter((obj) => {
      if (obj.value === arg) {
        arg = obj.label
      }
    })
    return arg
  }
  /**
   * 新增
   */
  public createComp() {
    this.createStatus = true
  }
  /**
   * 查看详情
   */
  public handleShowDetail(e: any) {
    // console.log('查看详情', e)
    this.detailObj = e
    this.isEdit = false
    this.showDetailStatus = true
  }
  /**
   * 编辑详情
   */
  public handleEditDetail(e: any) {
    this.detailObj = e
    this.isEdit = true
    this.showDetailStatus = true
  }
  /**
   * 审核
   */
  public handleCheckDetail(e: any) {
    this.currentOrgCode = e.orgCode
    this.createStatus = true
  }
  public fCompanyStatus(adata: any) {
    for (let i = 0; i < adata.length; i++) {
      let states = false
      if (adata[i].orgStatus === 1) {
        states = true
      }
      this.switchButtonIndex[i] = states
    }
  }
  /**
   * 监听企业状态的func
   */
  public async changeSwithState(index: any, adata: any) {
    let status
    this.switchButtonIndex[index] ? status = 1 : status = -1
    const { data } = await this.$apollo.provider.clients.org.mutate({
      mutation: g.delOrEditOrgByCoBo,
      variables: {
        token: this.$store.state.menu.token,
        orgCode: adata.orgCode,
        status
      }
    })
    await this.$apollo.queries.orgByCoBo.refetch()
  }
  public open(row: any) {
    this.orgCode = row
    this.staffShow = false
  }
  public changeEditState() {
    this.isEdit = true
  }
  public operatorType(val: any) {
    for (const iter of this.allPerson) {
      if (iter.commId === val) {
        return iter.name
      }
    }
    return ''
  }
  @Watch('pageTotalRows')
  private wPageTotalRows() {
    this.total = this.pageTotalRows
  }
}
</script>
