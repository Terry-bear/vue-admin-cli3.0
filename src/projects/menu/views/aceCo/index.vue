<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container" style="margin: 10px;">
      <svg-icon icon-class="searchIcon" class="search-icon"></svg-icon>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="搜索名称或权限组名称" v-model="filterKey">
      </el-input>
      <el-button v-if="sys_user_add" size="small" class="filter-item" style="margin-left:10px;padding:10px 15px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>

    <el-table :span-method="objectSpanMethod" :key='tableKey' :data="lists" v-loading="listLoading" :max-height="maxHeight" element-loading-text="给我一点时间" fit highlight-current-row style="width: 99%">
      <el-table-column align="center" prop="authorizeId" :label="AUTHORIZEID"></el-table-column>
      <el-table-column align="center" prop="companyNo" :label="COMPANYNO">
        <template slot-scope="{row}">
          <span v-html="fmtData(row.companyNo)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="companyName" :label="COMPANYNAME">
        <template slot-scope="{row}">
          <span v-html="fmtData(row.companyName)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="groupId" :label="GROUPID" show-overflow-tooltip></el-table-column>
      <el-table-column align="center" prop="groupName" :label="GROUPNAME">
        <template slot-scope="{row}">
          <span v-html="fmtData(row.groupName)"></span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="CREATETIME">
        <template slot-scope="{row}">
          <span>{{row.createTime | formatDate}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="updateTime" :label="UPDATETIME">
        <template slot-scope="{row}">
          <span>{{row.updateTime | formatDate}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" :label="OPT" width="200">
        <template slot-scope="scope">
          <el-button v-if="sys_user_del" size="small" type="danger" @click="deletes(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="sizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10, 20, 30]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog center :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item :label="COMPANYNO" prop="companyNo">
          <el-input v-model="form.companyNo" placeholder="请输企业编号"></el-input>
        </el-form-item>
        <el-form-item :label="COMPANYNAME" prop="companyName">
          <el-input v-model="form.companyName" placeholder="请输企业名称"></el-input>
        </el-form-item>
        <el-form-item :label="GROUPID">
          <el-input v-model="form.groupId" placeholder="请输权限群组标识"></el-input>
        </el-form-item>
        <el-form-item :label="GROUPNAME">
          <el-input v-model="form.groupName" placeholder="请输权限群组名称"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <center>
          <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
          <el-button v-if="dialogStatus=='create'" type="primary" @click="cancel('form')">取 消</el-button>
          <el-button v-else type="primary" @click="update('form')">修 改</el-button>
        </center>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import TableMixin from 'mixin/TableMixin'
import * as a from 'api/auth.gql'
import Mergecol from '@/utils/Mergecol.ts'
import OpenMessage from '@/utils/Message.ts'
import * as label from '@/projects/menu/assets/js/label-type.ts'
import SearchPro from '@/utils/SearchPro.ts'

@Component({})
export default class Index extends mixins(ExtVue, TableMixin) {
  @Prop() private name: string = 'table_user'
  private list: any
  private form!: any
  private companyMergeList!: any
  private companyMergeId!: string
  private filterKey!: string
  private dialogStatus!: string
  private total!: number
  private pageTotalCount!: number
  private listLoading!: boolean
  private dialogFormVisible!: boolean
  private sys_user_add!: boolean
  private sys_user_upd!: boolean
  private sys_user_del!: boolean
  public data() {
    return {
      loading: false,
      maxHeight: 1,
      companyMergeList: [],
      companyMergeId: [],
      filterKey: null,
      testlist: [],
      list: [],
      total: null,
      listLoading: true,
      pageTotalCount: null,
      pageTotalRows: null,
      listQuery: {
        page: 1,
        limit: 20
      },
      AUTHORIZEID: label.TO_AUTHORIZEID,
      COMPANYNO: label.TO_COMPANYNO,
      COMPANYNAME: label.TO_COMPANYNAME,
      GROUPID: label.TO_GROUPID,
      GROUPNAME: label.TO_GROUPNAME,
      UPDATETIME: label.TO_UPDATETIME,
      CREATETIME: label.TO_CREATETIME,
      OPT: label.TO_OPT,
      form: {
        companyNo: undefined,
        companyName: undefined,
        groupId: undefined,
        groupName: undefined
      },
      rules: {
        companyNo: [
          {
            required: true,
            message: '请输入企业编号',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur'
          }
        ],
        companyName: [
          {
            required: true,
            message: '请输入企业名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur'
          }
        ]
      },
      dialogFormVisible: false,
      dialogDeptVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      tableKey: 0
    }
  }
  public get lists(): string {
  const searchPro: any = new SearchPro(this.list, this.filterKey)
  return searchPro.fmtLists()
  }
  public created() {
    this.getList()
    this.sys_user_add = true
    this.sys_user_upd = true
    this.sys_user_del = true
  }
  public fmtData(val: any) {
    const searchPro = new SearchPro(this.list, this.filterKey)
    return searchPro.fmtData(val)
  }
  public objectSpanMethod({ row, column, rowIndex, columnIndex }: any) {
    const mergecol = new (Mergecol as any)()
    return mergecol.objectSpanCol(row, columnIndex, rowIndex, this.companyMergeList, this.companyMergeId)
  }
  public async getList() {
    try {
      const res = await this.$apollo.query({
        query: a.companyByTo,
        variables: {
          token: this.$store.state.menu.token,
          pageNo: this.listQuery.page,
          pageSize: this.listQuery.limit
        },
        fetchPolicy: 'network-only'
      })
      // console.log(res)
      this.listLoading = false
      const adata = res.data
      this.list = adata.companyByTo.pageRows
      this.pageTotalCount = adata.companyByTo.pageTotalCount
      this.pageTotalRows = adata.companyByTo.pageTotalRows
      // 根据数据合成需要的控制合并列的数据
      // this.companyMergeList = this.packMergeList(this.testlist)
      // this.companyMergeId = this.packMergeList(this.testlist, 'companyNo')
      const mergecol: any = new Mergecol(this.list)
      this.companyMergeList = mergecol.packMergeList()
      this.companyMergeId = mergecol.packMergeList('companyNo')
    } catch (error) {
      this.listLoading = false
      console.error(error.message)
      if (error.message === 'GraphQL error: Invalid Param for token') {
        this.$message({
          message: '您没有权限,请联系管理员',
          type: 'error'
        })
      } else {
        this.$message({
          message: '哦哦,服务器开小差了',
          type: 'error'
        })
        throw new Error(`query--companyByTo-->${error}`)
      }
    }
  }
  public sizeChange(val: any) {
    // console.log('sizeChange', val)
    // console.log(this.pageTotalRows)
    let computePageSize
    computePageSize = Math.ceil(this.pageTotalRows / val)
    if (val < this.pageTotalRows) {
      this.listQuery.limit = val
      if (this.listQuery.page > computePageSize) { this.listQuery.page = computePageSize }
    } else {
      this.listQuery.limit = val
    }
    this.getList()
  }
  public async getListByFilter(key: any) {
    try {
      const res = await this.$apollo.query({
        query: a.companyByTo,
        variables: {
          token: this.$store.state.menu.token,
          key,
          pageNo: this.listQuery.page,
          pageSize: this.listQuery.limit
        }
      })
      // console.log(res)
      this.listLoading = false
      const adata = res.data
      this.list = adata.companyByTo.pageRows
      this.pageTotalCount = adata.companyByTo.pageTotalCount
      this.pageTotalRows = adata.companyByTo.pageTotalRows
      const mergecol: any = new Mergecol(this.list)
      this.companyMergeList = mergecol.packMergeList()
      this.companyMergeId = mergecol.packMergeList('companyNo')
    } catch (error) {
      if (error.message === 'GraphQL error: notFound data') {
        this.list = []
      } else {
        this.$message({
          message: '哦哦,服务器开小差了',
          type: 'error'
        })
      }
      this.listLoading = false
      throw new Error(`queryFilter--companyByTo-->${error}`)
    }
  }
  public handleFilter() {
    this.listQuery.page = 1;
    (this as any).getListByFilter()
  }
  public handleCurrentChange(val: any) {
    this.listQuery.page = val
    this.getList()
  }
  public handleCreate() {
    this.dialogStatus = 'create'
    this.dialogFormVisible = true
  }
  public create(formName: string) {
    this.$refs[formName].validate(async (valid: boolean) => {
      if (valid) {
        this.listLoading = true
        this.listQuery.page = 1
        try {
          const res = await this.$apollo.mutate({
            mutation: a.newCompanyByTo,
            variables: {
              token: this.$store.state.menu.token,
              companyNo: this.form.companyNo,
              companyName: this.form.companyName,
              groupId: this.form.groupId,
              groupName: this.form.groupName
            }
          })
          // console.log(res)
          const adata = res.data
          this.dialogFormVisible = false
          const msg = new OpenMessage('添加成功', this.$message)
          msg.openSuccess()
          this.resetTemp()
          this.getList()
          this.listLoading = false
        } catch (error) {
          if (error.message === 'GraphQL error: companyNo is not Correct') {
            this.listLoading = false
            const msg = new OpenMessage('企业编号不正确', this.$message)
            msg.openError()
          } else {
            this.listLoading = false
            const msg = new OpenMessage('添加失败', this.$message)
            msg.openError()
            throw new Error(`mutation--newCompanyByTo-->${error}`)
          }
        }
      } else {
        this.$message({
          message: '请按照提示进行修改!',
          type: 'warning'
        })
        return false
      }
    })
  }
  public cancel() {
    this.dialogFormVisible = false
    this.$refs.form.resetFields()
  }
  public update(formName: string) {
    alert('修改')
  }
  public deletes(row: any) {
    this.listLoading = true
    this.listQuery.page = 1
    this.$apollo.mutate({
      mutation: a.delCompanyByTo,
      variables: {
        token: this.$store.state.menu.token,
        authorizeId: row.authorizeId
      }
    }
    ).then((res: any) => {
      // console.log(res)
      const adata = res.data
      if (adata !== null) {
        if (adata.delCompanyByTo) {
          const msg = new OpenMessage('删除成功', this.$message)
          msg.openSuccess()
          this.resetTemp()
          this.getList()
        } else {
          const msg = new OpenMessage('删除失败', this.$message)
          msg.openError()
          this.resetTemp()
          this.getList()
        }
      } else {
        const msg = new OpenMessage('删除失败', this.$message)
        msg.openError()
        // alert(res.errors.message)
      }
    }).catch((err: any) => {
      console.log(err)
      const msg = new OpenMessage('删除失败', this.$message)
      msg.openError()
    })
  }
  public resetTemp() {
    this.form = {
      companyNo: null,
      companyName: null,
      groupId: null,
      groupName: null
    }
  }
  @Watch('filterKey')
  private wFilterKey() {
    // 节流减少频繁修改的实时搜索
    let timer
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (this.filterKey) {
        this.getListByFilter(this.filterKey)
      } else {
        this.getList()
      }
    }, 250)
  }
  @Watch('pageTotalRows')
  private wPageTotalRows() {
    this.total = this.pageTotalRows
  }
}
</script>
