<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container" style="margin: 10px;">
      <svg-icon icon-class="searchIcon" class="search-icon"></svg-icon>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="搜索名称或服务标识" v-model="filterServerName">
      </el-input>
      <el-button v-if="sys_user_add" size="small" class="filter-item" style="margin-left:10px;padding:10px 15px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>
    <table-list :list="list" :filterServerName="filterServerName" :listLoading="listLoading" ref="tableList"></table-list>
    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10, 20, 30]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog center :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item :label="SERVERNO" prop="serverNo">
          <el-input v-model="form.serverNo" placeholder="请输服务编号"></el-input>
        </el-form-item>
        <el-form-item :label="SERVERNAME" prop="serverName">
          <el-input v-model="form.serverName" placeholder="请输入服务名称"></el-input>
        </el-form-item>
        <el-form-item :label="GROUPID">
          <el-input v-model="form.groupId"></el-input>
        </el-form-item>
        <el-form-item :label="GROUPNAME">
          <el-input v-model="form.groupName"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <center>
          <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
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
import { mapGetters } from 'vuex'
import OpenMessage from '@/utils/Message.ts'
import TableList from './TableList.vue'
import * as label from '@/projects/menu/assets/js/label-type.ts'

@Component({
  components: {
    TableList
  }
})
export default class Index extends mixins(ExtVue, TableMixin) {
  @Prop() private name: string = 'table_user'
  private list: any
  private form!: any
  private companyMergeList!: any
  private companyMergeId!: string
  private filterServerName!: string
  private dialogStatus!: string
  private total!: number
  private pageTotalCount!: number
  private listLoading!: boolean
  private dialogFormVisible!: boolean
  private sys_user_add!: boolean
  public data() {
    return {
      loading: false,
      list: null,
      total: null,
      listLoading: true,
      filterServerName: null,
      pageTotalCount: null,
      pageTotalRows: null,
      listQuery: {
        page: 1,
        limit: 10
      },
      SERVERNO: label.TO_SERVERNO,
      SERVERNAME: label.TO_SERVERNAME,
      GROUPID: label.TO_GROUPID,
      GROUPNAME: label.TO_GROUPNAME,
      form: {
        serverNo: null,
        serverName: null,
        groupId: null,
        groupName: null
      },
      rules: {
        serverNo: [
          {
            required: true,
            message: '请输入服务编号',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur'
          }
        ],
        serverName: [
          {
            required: true,
            message: '请输入服务名称',
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
      }
    }
  }
  public created() {
    this.getList()
    this.sys_user_add = true
  }
  public async getList() {
    try {
      const res = await this.$apollo.query({
        query: a.serverByTo,
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
      this.list = adata.serverByTo.pageRows
      // console.table(this.list)
      this.pageTotalCount = adata.serverByTo.pageTotalCount
      this.pageTotalRows = adata.serverByTo.pageTotalRows
    } catch (error) {
      this.listLoading = false
      console.log(error)
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
        throw new Error(`query--serverByTo-->${error}`)
      }
    }
  }
  public async getListByFilter(key: string | null) {
    try {
      const res = await this.$apollo.query({
        query: a.serverByTo,
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
      this.list = adata.serverByTo.pageRows
      this.pageTotalCount = adata.serverByTo.pageTotalCount
      this.pageTotalRows = adata.serverByTo.pageTotalRows
    } catch (error) {
      if (error.message === 'GraphQL error: notFound data') {
        this.list = []
      } else {
        this.$message({
          message: '哦哦,服务器开小差了',
          type: 'error'
        })
        throw new Error(`query--serverByToFilter-->${error}`)
      }
      this.listLoading = false
    }
  }
  public handleFilter() {
    this.listLoading = true
    this.listQuery.page = 1
    this.getListByFilter(null)
  }
  public handleCurrentChange(val: any) {
    console.log('handleCurrentChange', val)
    this.listQuery.page = val
    this.getList()
  }
  public handleCreate() {
    this.resetTemp()
    this.dialogStatus = 'create'
    this.dialogFormVisible = true
  }
  public create(formName: any) {
    this.$refs[formName].validate(async (valid: boolean) => {
      if (valid) {
        this.listLoading = true
        this.listQuery.page = 1
        try {
          const res = await this.$apollo.mutate({
            mutation: a.newServerByTo,
            variables: {
              token: this.$store.state.menu.token,
              serverNo: this.form.serverNo,
              serverName: this.form.serverName,
              groupId: this.form.groupId,
              groupName: this.form.groupName
            }
          })
          console.log(res)
          const adata = res.data
          this.dialogFormVisible = false
          const msg = new OpenMessage('添加成功', this.$message)
          msg.openSuccess()
          this.resetTemp()
          this.getList()
          this.listLoading = false
        } catch (error) {
          if (error.message === 'GraphQL error: serverNo is not Correct') {
            this.listLoading = false
            const msg = new OpenMessage('服务编号不正确', this.$message)
            msg.openError()
          } else if (error.message === 'serverName is not Correct by serverNo') {
            this.listLoading = false
            const msg = new OpenMessage('服务名称不在服务编号中', this.$message)
            msg.openError()
          } else {
            this.listLoading = false
            const msg = new OpenMessage('添加失败', this.$message)
            msg.openError()
            throw new Error(`mutation--newServerByTo-->${error}`)
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
  public deletes(row: any) {
    this.listLoading = true
    this.listQuery.page = 1
    this.$apollo.mutate({
      mutation: a.delServerByTo,
      variables: {
        token: this.$store.state.menu.token,
        authorizeId: row.authorizeId
      }
    }
    ).then((res: any) => {
      console.log(res)
      const adata = res.data
      if (adata !== null) {
        if (adata.delServerByTo) {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.resetTemp()
          this.getList()
        } else {
          this.$message({
            message: '删除失败',
            type: 'error'
          })
          this.resetTemp()
          this.getList()
        }
      } else {
        this.$message({
          message: '删除失败',
          type: 'error'
        })
        // alert(res.errors.message)
      }
    }).catch((err: any) => {
      console.log(err)
      this.$message({
        message: '删除失败',
        type: 'error'
      })
    })
  }
  public cancel() {
    this.dialogFormVisible = false
    this.$refs.form.resetFields()
  }
  public resetTemp() {
    this.form = {
      serverNo: '',
      serverName: '',
      groupId: '',
      groupName: ''
    }
  }
  @Watch('filterServerName')
  private wFilterServerName() {
    if (this.filterServerName) {
        this.getListByFilter(this.filterServerName)
      } else {
        this.getList()
      }
  }
  @Watch('pageTotalRows')
  private wPageTotalRows() {
    this.total = this.pageTotalRows
  }
}
</script>

<style lang="scss">
</style>
