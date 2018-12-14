<template>
  <div class="app-container">
    <div v-if="taskListShow" class="browser-navigation-hidden" v-loading="allLoading">
      <div class="calendar-list-container">
        <div class="filter-container" style="margin: 15px;font-size: 14px;">
          <span style="margin-left: 14px;" class="top-select-button-m">姓名: </span>
          <el-input style="width: 200px;" class="filter-item" size="mini" placeholder="请输入" v-model="queryNme">
          </el-input>
          <span style="margin-left: 30px;" class="top-select-button-m">电话: </span>
          <el-input style="width: 200px;" class="filter-item" size="mini" placeholder="请输入" v-model="queryPhone">
          </el-input>
          <span style="margin-left: 30px;" class="top-select-button-m">负责村: </span>
          <el-input style="width: 200px;" class="filter-item" size="mini" placeholder="请输入" v-model="queryArea">
          </el-input>
          <el-button style="margin-left: 20px;" size="mini" class="filter-item top-select-button-m" type="primary" icon="search" @click="searchFilter">查询</el-button>
          <el-button style="margin-left: 20px;" size="mini" class="filter-item top-select-button-m" icon="edit" @click="resetBtn">重置</el-button>
          <el-button style="margin-left: 20px;" size="mini" class="filter-item top-select-button-m" icon="edit" type="primary" @click="addExecutorButton"> + &nbsp;&nbsp;新增</el-button>
          <!-- <div class="executor_excel_style" style="cursor:pointer;">
            <span style="position: absolute; left: 26%; top: 4px; cursor: pointer;">导入</span>
            <input type="file" style="width: 100%;height: 100%;opacity:0;font-size: 0;cursor: pointer;position: absolute;top: 0;z-index: 5;" ref="excelFile" @change="importData">
          </div>
          <div class="download-btn" @click="downloadTemplate">
            <span>下载模板</span>
          </div> -->
        </div>
        <el-table :data="list" tooltip-effect="dark" v-loading="$apollo.loading" element-loading-text="给我一点时间" :max-height="maxHeight" fit highlight-current-row style="width: calc(99% - 48px);">
          <el-table-column type="expand">
            <template slot-scope="props" class="hidden-info">
              <div class="hidden-info-name">负责的村</div>
              <el-row :gutter="20">
                <el-col :span="8" v-for="item in props.row.areaList" :key="item.areaCode">
                  <div class="hidden-info-content">
                    <el-popover placement="top-start" width="250" trigger="hover" :content="item.areaName" v-if="item.areaName.length > 10">
                      <span slot="reference">{{item.areaName}}</span>
                    </el-popover>
                    <span slot="reference" v-else>{{item.areaName}}</span>
                  </div>
                </el-col>
              </el-row>
            </template>
          </el-table-column>
          <el-table-column label="姓名" min-width="15%">
            <template slot-scope="props">
              <span v-html="props.row.name"></span>
            </template>
          </el-table-column>
          <el-table-column label="身份证号" min-width="20%">
            <template slot-scope="props"> {{props.row.idCard | hideMiddle}}</template>
          </el-table-column>
          <el-table-column prop="taskStatus" label="电话" min-width="18%">
            <template slot-scope="props">
              <span v-html="props.row.mobileNo"></span>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="账号状态" min-width="12%">
            <template slot-scope="props">
              <span style="margin-right: 8px;">{{ props.row.executorStatus | executorStatusString}}</span>
              <el-switch v-model="switchButtonIndex[props.$index]" active-color="#3F9EFF" inactive-color="#b7b9bb" @change="changeSwithState(props.$index, props.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="20%">
            <template slot-scope="props">
              <div>
                <el-button type="text" size="medium" @click="handleShowOrEdit(props.row, false)">查看</el-button>
                <vertical></vertical>
                <el-button type="text" size="medium" @click="handleShowOrEdit(props.row, true)">编辑</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10, 20, 30]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
          </el-pagination>
        </div>
      </div>
    </div>
    <show-and-edit v-if="isShowOrEdit" :isShowOrEdit="isShowOrEdit" :showOrEditData="showOrEditData" :isEdit="isEdit" @changeIsEdit="changeIsEdit" @changeShowState="changeShowState"></show-and-edit>
    <add-executor v-if="showAddExecutor" @changeAddExecutor="changeAddExecutor"></add-executor>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import TableMixin from 'mixin/TableMixin'
import ExtVue from 'mixin/ExtVue'
import * as taskGql from '@/projects/menu/graphql/task.gql'
import UpLoad from '@/projects/menu/views/components/UpLoad.vue'
import MapPosition from '@/projects/menu/views/components/MapPosition.vue'
import '@/projects/menu/assets/scss/rh_table.scss'
import showAndEdit from './showAndEdit.vue'
import addExecutor from './addExecutor.vue'
const axios = require('axios')

@Component({
  components: {
    showAndEdit,
    addExecutor
  },
  apollo: {
    $client: 'task',
    $loadingKey: 'loading',
    executorByCoBo() {
      return {
        query: taskGql.executorByCoBo,
        variables() {
          return {
            token: this.$store.state.menu.token,
            pageNo: this.listQuery.page,
            pageSize: this.listQuery.limit,
            name: this.Name,
            mobileNo: this.Phone,
            village: this.Area
          }
        },
        result({ data, loading }) {
          if (!loading) {
            this.list = []
            if (data.executorByCoBo !== undefined) {
              this.fCompanyStatus(data.executorByCoBo.pageRows)
              this.pageTotalCount = data.executorByCoBo.pageTotalCount
              this.pageTotalRows = data.executorByCoBo.pageTotalRows
              this.list = JSON.parse(JSON.stringify(data.executorByCoBo.pageRows))
            } else {
              this.list = []
              this.pageTotalCount = 0
              this.pageTotalRows = 0
            }
          }
        },
        error(error) {
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
    executorStatusString(arg: any) {
      arg = arg.toString()
      const executorStatus: string[] = ['停用', '启用']
      return executorStatus[arg]
    },
    hideMiddle(val: any) {
      if (val === undefined || val === null || val === '') {
        return ''
      }
      val = val.toString()
      return `${val.substring(0, 6)}********${val.substring(val.length - 4)}`
    },
    stringFormat(val: any) {
      const stringArr = val.split('/')
      let areaName = ''
      for (const iter of stringArr) {
        areaName += iter
      }
      return areaName
    }
  }
})
export default class Index extends mixins(TableMixin, ExtVue) {
  private Name!: string
  private queryNme!: string
  private Phone!: string
  private queryPhone!: string
  private Area!: string
  private queryArea!: string
  private switchButtonIndex!: any[]
  private isShowOrEdit!: boolean
  private isEdit!: boolean
  private showOrEditData!: any[]
  private taskListShow!: boolean
  private showAddExecutor!: boolean
  private total!: number
  public data() {
    return {
      taskListShow: true,
      loading: false,
      listQuery: {
        page: 1,
        limit: 10
      },
      maxHeight: 1,
      total: 0,
      pageTotalRows: null,
      pageTotalCount: null,
      queryNme: '',
      queryPhone: '',
      queryArea: '',
      Name: '',
      Phone: '',
      Area: '',
      switchButtonIndex: [],
      list: [],
      isShowOrEdit: false,
      showOrEditData: [],
      isEdit: false,
      showAddExecutor: false,
      allLoading: false
    }
  }
  public handleCurrentChange(val: any) {
    this.listQuery.page = val
  }
  public searchFilter() {
    this.listQuery.page = 1
    this.Name = this.queryNme
    this.Phone = this.queryPhone
    this.Area = this.queryArea
    this.$apollo.queries.executorByCoBo.refetch()
  }
  public resetBtn() {
    this.Name = this.queryNme = ''
    this.Phone = this.queryPhone = ''
    this.Area = this.queryArea = ''
    this.$apollo.queries.executorByCoBo.refetch()
  }
  public fCompanyStatus(adata: any[]) {
    for (let i = 0; i < adata.length; i++) {
      let states = false
      if (adata[i].executorStatus === 1) {
        states = true
      }
      this.switchButtonIndex[i] = states
    }
  }
  public async changeSwithState(index: number, adata: any) {
    const userId = adata.userId
    if (userId) {
      try {
        const res = await this.$apollo.provider.clients.task.mutate({
          mutation: taskGql.actExecutorByCoBo,
          variables: {
            token: this.$store.state.menu.token,
            userId: adata.userId,
            status: this.switchButtonIndex[index]
          }
        })
        const resultData = res.data
        if (resultData.actExecutorByCoBo) {
          this.$apollo.queries.executorByCoBo.refetch()
        } else {
          this.$message({
            message: '更改失败~',
            type: 'error'
          })
          this.$apollo.queries.executorByCoBo.refetch()
        }
      } catch (error) {
        const message = JSON.parse(JSON.stringify(error)).message
        let errorInfo = '更改失败~'
        if (message.includes('No right to modify the userId')) {
          errorInfo = '无权操作该执行人'
        }
        this.$apollo.queries.executorByCoBo.refetch()
        this.$message({
          message: errorInfo,
          type: 'error'
        })
      }
    }
  }
  public changeShowState() {
    this.isShowOrEdit = false
  }
  public changeIsEdit() {
    this.isEdit = true
  }
  public handleShowOrEdit(data: any, state: boolean) {
    this.isShowOrEdit = true
    this.isEdit = state
    this.showOrEditData = data
  }
  public addExecutorButton() {
    this.taskListShow = false
    this.showAddExecutor = true
  }
  public changeAddExecutor() {
    this.taskListShow = true
    this.showAddExecutor = false
  }
  @Watch('pageTotalRows')
  private wPageTotalRows() {
    this.total = this.pageTotalRows
  }

}
</script>

<style lang="scss" scoped>
.download-btn {
  -webkit-user-select: none;
  user-select: none;
  background-image: url('../../assets/img/download_icon.png');
  background-repeat: no-repeat;
  background-position-x: 14px;
  background-position-y: 8px;
  background-size: 12px 12px;
  // background-color: #fff;
  text-align: center;
  line-height: 28px;
  font: 400 11px;
  color: rgba(0, 0, 0, 0.65);
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 5px;
  box-sizing: border-box;
  width: 106px;
  height: 28px;
  margin: {
    left: 20px;
  }
  display: inline-block;
  top: -20px;
  left: 81px;
  &:hover {
    cursor: pointer;
    color: #409eff;
    background-color: #ebf5ff;
    border-color: #c6e2ff;
    transition: 0.1s all;
  }
  span {
    padding: {
      left: 20px;
    }
  }
}
.task-types td {
  max-width: 150px !important;
}
.top-select-button-m {
  margin-bottom: 18px;
  margin-left: 30px;
}
.hidden-info-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  line-height: 30px;
}
.hidden-info-content {
  padding: 0 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.65);
  line-height: 30px;
}
.executor_excel_style {
  position: relative;
  margin-left: 20px;
  color: #fff;
  background-color: #409eff;
  border-color: #409eff;
  display: inline-block;
  border-radius: 3px;
  height: 28px;
  width: 60px;
  overflow: hidden;
  top: 10px;
}
.executor_excel_style:hover {
  opacity: 0.8;
}
</style>
<style>
.clear-must label:before {
  content: '' !important;
}
</style>
