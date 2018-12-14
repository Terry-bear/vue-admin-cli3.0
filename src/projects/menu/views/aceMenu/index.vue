<template>
  <div class="app-container calendar-list-container">
    <div class="filter-container" style="margin: 10px;">
      <svg-icon icon-class="searchIcon" class="search-icon"></svg-icon>
      <el-input @keyup.enter.native="handleFilter" style="width: 200px;" class="filter-item" placeholder="搜索名称" v-model="filterMenuName">
      </el-input>
      <el-button v-if="sys_user_add" size="small" class="filter-item" style="margin-left:10px;padding:10px 15px;" @click="handleCreate" type="primary" icon="edit">添加</el-button>
    </div>

    <el-table :key='tableKey' :data="lists" v-loading="listLoading" :max-height="maxHeight" element-loading-text="给我一点时间" fit highlight-current-row style="width: 99%">

      <el-table-column align="center" :label="MENUID">
        <template slot-scope="scope">
          <span>{{scope.row.menuId}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="LABEL">
        <template slot-scope="scope">
          <span v-html="fmtData(scope.row.label)"></span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="ICON">
        <template slot-scope="scope">
          <svg-icon :icon-class="scope.row.icon" style="width:20px;height:20px;"></svg-icon>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="HREF" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{scope.row.href}} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="CREATETIME">
        <template slot-scope="scope">
          <span>{{scope.row.createTime | formatDate}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="UPDATETIME">
        <template slot-scope="scope">
          <span>{{scope.row.updateTime | formatDate}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" class-name="status-col" :label="STATUS">
        <template slot-scope="scope">
          <span>{{scope.row.useCount}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="OPT" width="200">
        <template slot-scope="scope">
          <el-button v-if="sys_user_upd" size="small" type="primary" @click="handleUpdate(scope.row)">编辑
          </el-button>
          <el-button v-if="sys_user_del" size="small" type="danger" @click="deletes(scope.row)" :disabled="scope.row.useCount > 0">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="sizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10, 20, 30]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDeptVisible">
      <el-tree class="filter-tree" :data="treeDeptData" :default-checked-keys="checkedKeys" check-strictly node-key="id" highlight-current ref="deptTree" :props="defaultProps" @node-click="getNodeData" default-expand-all>
      </el-tree>
    </el-dialog>

    <el-dialog center :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :before-close="cancel">
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item :label="LABEL" prop="username">
          <el-input v-model="form.username" placeholder="请输名称"></el-input>
        </el-form-item>

        <el-form-item :label="ICON" prop="icon">
          <el-input v-model="form.icon" placeholder="请输图标"></el-input>
        </el-form-item>

        <el-form-item :label="HREF">
          <el-input v-model="form.href" placeholder="请输链接地址"></el-input>
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

<script lang='ts'>
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import TableMixin from 'mixin/TableMixin'
import * as m from 'api/menu.gql'
import { mapGetters } from 'vuex'
import OpenMessage from '@/utils/Message.ts'
import * as label from '@/projects/menu/assets/js/label-type.ts'
import SearchPro from '@/utils/SearchPro.ts'
@Component({})
export default class Index extends mixins(ExtVue, TableMixin) {
  @Prop() private name: string = 'table_user'
  private list: any
  private form!: any
  private companyMergeList!: any
  private filterMenuName!: any
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
  // 高亮显示搜索内容
  public get lists(): string {
    const searchPro: any = new SearchPro(this.list, this.filterMenuName)
    return searchPro.fmtLists()
  }
  public data() {
    return {
      loading: false,
      maxHeight: 1,
      treeDeptData: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      list: null,
      total: null,
      listLoading: true,
      filterMenuName: null,
      pageTotalCount: null,
      pageTotalRows: null,
      computPageSize: null,
      listQuery: {
        page: 1,
        limit: 20
      },
      MENUID: label.TO_MENUID,
      LABEL: label.TO_LABEL,
      ICON: label.TO_ICON,
      HREF: label.TO_HREF,
      STATUS: label.TO_STATUS,
      UPDATETIME: label.TO_UPDATETIME,
      CREATETIME: label.TO_CREATETIME,
      OPT: label.TO_OPT,
      form: {
        username: null,
        icon: null,
        href: null,
        menuid: null
      },
      rules: {
        username: [
          {
            required: true,
            message: '请输入账户',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        icon: [
          {
            required: true,
            message: '请输入图标',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        newpassword1: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 5,
            max: 20,
            message: '长度在 5 到 20 个字符',
            trigger: 'blur'
          }
        ],
        deptId: [
          {
            required: true,
            message: '请选择部门',
            trigger: 'blur'
          }
        ],
        role: [
          {
            required: true,
            message: '请选择角色',
            trigger: 'blur'
          }
        ],
        phone: [
          {
            required: true,
            message: '手机号',
            trigger: 'blur'
          },
          {
            min: 11,
            max: 11,
            message: '长度在11 个字符',
            trigger: 'blur'
          }
        ]
      },
      statusOptions: ['0', '1'],
      rolesOptions: [],
      dialogFormVisible: false,
      dialogDeptVisible: false,
      userAdd: false,
      userUpd: false,
      userDel: false,
      dialogStatus: '',
      textMap: {
        update: '编辑',
        create: '创建'
      },
      isDisabled: {
        0: false,
        1: true
      },
      tableKey: 0
    }
  }
  public created() {
    this.getList()
    this.sys_user_add = true
    this.sys_user_upd = true
    this.sys_user_del = true
  }
  public fmtData(val: any) {
    const searchPro = new SearchPro(this.list, this.filterMenuName)
    return searchPro.fmtData(val)
  }
  public async getList() {
    try {
      const res = await this.$apollo.provider.clients.menu.query({
        query: m.menuByCoTo,
        variables: {
          token: this.$store.state.menu.token,
          companyNo: this.$store.state.menu.tokenObj.def,
          pageNo: this.listQuery.page,
          pageSize: this.listQuery.limit
        },
        fetchPolicy: 'network-only'
      })
      // console.log(res)
      this.listLoading = false
      const adata = res.data
      this.list = adata.menuByCoTo.pageRows
      this.pageTotalCount = adata.menuByCoTo.pageTotalCount
      this.pageTotalRows = adata.menuByCoTo.pageTotalRows
    } catch (error) {
      this.listLoading = false
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
        throw new Error(`query--menuByCoTo-->${error}`)
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
      const res = await this.$apollo.provider.clients.menu.query({
        query: m.menuByCoTo,
        variables: {
          token: this.$store.state.menu.token,
          companyNo: this.$store.state.menu.tokenObj.def,
          pageNo: this.listQuery.page,
          pageSize: this.listQuery.limit,
          key
        },
        fetchPolicy: 'network-only'
      })
      // console.log(res)
      this.listLoading = false
      const adata = res.data
      this.list = adata.menuByCoTo.pageRows
      this.pageTotalCount = adata.menuByCoTo.pageTotalCount
      this.pageTotalRows = adata.menuByCoTo.pageTotalRows
    } catch (error) {
      if (error.message === 'GraphQL error: notFound data') {
        this.list = []
      } else {
        this.$message({
          message: '哦哦,服务器开小差了',
          type: 'error'
        })
        throw new Error(`query--menuByCoToFilter-->${error}`)
      }
      this.listLoading = false
    }
  }
  public getNodeData(data: any) {
    alert('getNodeData')
  }
  public handleDept() {
    alert('handleDept')
  }
  public handleFilter() {
    this.listQuery.page = 1
    this.getList()
  }
  public handleCurrentChange(val: any) {
    this.listQuery.page = val
    this.getList()
  }
  public handleCreate() {
    this.resetTemp()
    this.dialogStatus = 'create'
    this.dialogFormVisible = true
  }
  public handleUpdate(row: any) {
    // console.log('row', row)
    this.resetTemp()
    this.form.username = row.label
    this.form.icon = row.icon
    this.form.href = row.href
    this.form.menuid = row.menuId
    this.dialogStatus = 'update'
    this.dialogFormVisible = true
  }
  public create(formName: any) {
    this.$refs[formName].validate(async (valid: boolean) => {
      if (valid) {
        this.listLoading = true
        this.listQuery.page = 1
        try {
          const res = await this.$apollo.provider.clients.menu
            .mutate({
              mutation: m.newMenuByCoTo,
              variables: {
                token: this.$store.state.menu.token,
                companyNo: this.$store.state.menu.tokenObj.def,
                label: this.form.username,
                href: this.form.href ? this.form.href : null,
                icon: this.form.icon
              }
            })
          //  console.log(res)
          const adata = res.data
          this.dialogFormVisible = false
          const msg = new OpenMessage('添加成功', this.$message)
          msg.openSuccess()
          this.resetTemp()
          this.getList()
        } catch (error) {
          this.dialogFormVisible = false
          console.log(error)
          throw new Error(`mutation--newMenuByCoTo-->${error}`)
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
  public update(form: any) {
    // console.log('form', this.form)
    // console.log('menuId', this.form.menuid)
    this.$refs[form].validate((params: boolean) => {
      if (!params) {
        this.$message({
          message: '请按规则填写',
          type: 'warning'
        })
        return false
      } else {
        this.$apollo.provider.clients.menu
          .mutate({
            mutation: m.editMenuByCoTo,
            variables: {
              token: this.$store.state.menu.token,
              companyNo: this.$store.state.menu.tokenObj.def,
              menuId: this.form.menuid,
              label: this.form.username,
              href: this.form.href ? this.form.href : null,
              icon: this.form.icon
            }
          })
          .then((res: any) => {
            // console.log(res)
            const adata = res.data
            if (adata !== null) {
              this.resetTemp()
              this.dialogFormVisible = false
              this.getList()
            } else {
              alert(res.errors.message)
            }
          }).catch((err: any) => {
            if (err.message === 'GraphQL error: Data for the same primary key exist') {
              this.$message({
                message: '存在相同的连接地址',
                type: 'warning'
              })
            } else {
              console.log(err)
              this.$message({
                message: '提交失败啦',
                type: 'error'
              })
            }
          })
      }
    })
  }
  public deletes(row: any) {
    // console.log('delrow', row)
    this.$apollo.provider.clients.menu
      .mutate({
        mutation: m.delMenuByCoTo,
        variables: {
          token: this.$store.state.menu.token,
          companyNo: this.$store.state.menu.tokenObj.def,
          menuIds: [row.menuId]
        }
      })
      .then((res: any) => {
        // console.log(res)
        const adata = res.data
        if (adata !== null) {
          this.resetTemp()
          const msg = new OpenMessage('删除成功', this.$message)
          msg.openSuccess()
          this.dialogFormVisible = false
          this.getList()
        } else {
          alert(res.errors.message)
        }
      }).catch((err: any) => {
        console.log(err)
        alert(err)
      }
      )
  }
  public resetTemp() {
    this.form = {
      name: undefined,
      icon: undefined,
      href: undefined,
      menuid: undefined
    }
  }
  @Watch('filterMenuName')
  private wFilterMenuName() {
    if (this.filterMenuName) {
      this.getListByFilter(this.filterMenuName)
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

<style lang="scss" scoped>
</style>
