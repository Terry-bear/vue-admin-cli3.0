<template>
  <div class="wrapper">
    <back-btn :cancle="rollback"></back-btn>
    <div class="custom-tree-container" style="width: 1160px;height: 700px;padding:10px;">
      <el-card class="box-card-left" style="width: 300px;">
        <span>企业架构信息</span>
        <el-tree :data="orgApartArr" v-loading="loading" node-key="id" default-expand-all :expand-on-click-node="false" style="width: 300px;height: 400px;">
          <span class="custom-tree-node" slot-scope="{ node, data }">
            <span style="width:100%;height:100%" @click="clickSpan(node)">{{ data.label}}</span>
          </span>
        </el-tree>
      </el-card>
      <el-card class="box-card-right input-disable-custom" style="width: 900px; position: relative">
        <el-button size="small" v-if="sys_user_add" class="filter-item filter-Item" @click="handleCreate" type="primary" icon="edit">添加</el-button>
        <el-table :data="orgStaffArr" style="width: 100%" v-loading="listLoading">
          <el-table-column label="时间" width="180">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>
                  开始时间:
                  <span style="margin-left: 10px">{{ scope.row.createTime | formatDate}}</span>
                </p>
                <p>
                  结束时间:
                  <span style="margin-left: 10px">{{ scope.row.updateTime | formatDate}}</span>
                </p>
                <div slot="reference" class="name-wrapper">
                  <i class="el-icon-time"></i>
                  <el-tag size="medium">{{ scope.row.createTime | formatDate}}</el-tag>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="手机号">
            <template slot-scope="scope">
              <span>{{ scope.row.eePhone }}</span>
            </template>
          </el-table-column>
          <el-table-column label="住址">
            <template slot-scope="scope">
              <span>{{ scope.row.postalAddr }}</span>
            </template>
          </el-table-column>
          <el-table-column label="姓名" width="180">
            <template slot-scope="scope">
              <el-popover trigger="hover" placement="top">
                <p>姓名: {{ scope.row.eeName }}</p>
                <p>住址: {{ scope.row.postalAddr }}</p>
                <div slot="reference" class="name-wrapper">
                  <span size="medium">{{ scope.row.eeName}}</span>
                </div>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button v-if="sys_user_upd" size="mini" type="primary" @click="handleUpdate(scope.row)">编辑
              </el-button>
              <el-button v-if="sys_user_del" size="mini" type="danger" @click="deletes(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <!-- 弹框 -->
        <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogDeptVisible">
          <el-tree class="filter-tree" :data="treeDeptData" :default-checked-keys="checkedKeys" check-strictly node-key="id" highlight-current ref="deptTree" :props="defaultProps" @node-click="getNodeData" default-expand-all>
          </el-tree>
        </el-dialog>

        <el-dialog center :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" width="50%" :before-close="cancel">
          <el-form :model="form" :rules="rules" ref="form" label-width="100px">
            <el-form-item label="手机号" prop="eePhone">
              <el-input v-model="form.eePhone" placeholder="请输手机号" />
            </el-form-item>
            <el-form-item label="住址" prop="postalAddr">
              <el-input v-model="form.postalAddr" placeholder="请输住址" />
            </el-form-item>
            <el-form-item label="姓名" prop="eeName">
              <el-input v-model="form.eeName" placeholder="请输姓名" />
            </el-form-item>
            <el-form-item label="部门" prop="levelId">
              <el-cascader :options="partArr" v-model="form.levelId" placeholder="请选择部门" />
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button v-if="dialogStatus=='create'" type="primary" @click="create('form')">确 定</el-button>
            <el-button v-else type="primary" @click="update('form')">修 改</el-button>
          </span>
        </el-dialog>
        <!-- 分页 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-size="listQuery.limit" layout="prev, pager, next, jumper" :total="total">
        </el-pagination>
      </el-card>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import TableMixin from 'mixin/TableMixin'
import BackBtn from '@/components/BackBtn.vue'
import * as label from '@/projects/menu/assets/js/label-type.ts'
import OpenMessage from '@/utils/Message.ts'
import * as o from '@/projects/menu/graphql/org.gql'
@Component({
  components: {
    BackBtn
  }
})
export default class Staff extends mixins(ExtVue, TableMixin) {
  @Prop() private message: any
  private sys_user_add!: boolean
  private sys_user_upd!: boolean
  private sys_user_del!: boolean
  private listLoading!: boolean
  private dialogFormVisible!: boolean
  private lesseeKey!: string
  private def!: string
  private orgApartArr!: any[]
  private partArr!: any[]
  private orgStaffArr!: any[]
  private departmentArr!: any[]
  private form!: any
  private dialogStatus!: any
  private active!: number
  private total!: number

  public data() {
    return {
      values: '',
      texts: '',
      props: {
        value: 'id',
        label: 'name',
        children: 'cities'
      },
      listLoading: true,
      dialogFormVisible: false,
      dialogVisible: false,
      formLabelWidth: '120px',
      loading: true,
      dialogDeptVisible: false,
      treeDeptData: [],
      checkedKeys: [],
      defaultProps: {
        children: 'children',
        label: 'eeName'
      },
      total: null,
      // selectedOptions: [], // 部门名
      dialogStatus: '',
      lesseeKey: this.$store.state.menu.tokenObj.lesseeKey,
      def: this.$store.state.menu.tokenObj.def,
      orgApartArr: [],
      partArr: [],
      departmentArr: [],
      active: 0,
      orgStaffArr: [],
      value: '',
      argsData: [],
      pageTotalRows: null,
      listQuery: {
        page: 1,
        limit: 10
      },
      textMap: {
        update: '编辑',
        create: '创建'
      },
      form: {
        eePhone: null,
        postalAddr: null,
        eeName: null,
        levelId: null
      },
      rules: {
        eePhone: [
          {
            required: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator(rule: any, value: string, callback: (arg?: Error) => any) {
              const MobileRegex = /^1[0-9]{10}$/
              if (!MobileRegex.test(value)) {
                callback(new Error('手机号码格式不正确！'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        postalAddr: [
          {
            required: true,
            message: '请输入住址',
            trigger: 'blur'
          },
          {
            function(rule: any, value: string, callback: (arg?: Error) => any) {
              const MobileRegex = /^1[0-9]{10}$/
              if (!MobileRegex.test(value)) {
                callback(new Error('请输入正确的地址'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        eeName: [
          {
            required: true,
            message: '请输入姓名',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 20,
            message: '长度在 3 到 20 个字符',
            trigger: 'blur'
          }
        ],
        levelId: [
          { required: true, message: '请选择部门', trigger: 'blur' }
        ]
      }
    }
  }
  public created() {
    this.getComApartList()
    this.getList()
    this.sys_user_add = true
    this.sys_user_upd = true
    this.sys_user_del = true
  }
  /**
   * 获取企业架构信息
   */
  public async getComApartList() {
    try {
      const { data } = await this.$apollo.provider.clients.org.query({
        query: o.orgLevelByCoBoNew,
        variables: {
          token: this.$store.state.menu.token,
          orgCode: this.message.orgCode,
          companyNo: this.lesseeKey !== '' ? '' : this.def
        },
        fetchPolicy: 'network-only'
      })
      const orgApartArr = [{
        children: JSON.parse(JSON.stringify(data.orgLevelByCoBo)),
        value: this.message.orgCode,
        label: this.message.orgName,
        status: this.message.status
      }]
      this.orgApartArr = orgApartArr
      this.partArr = this.recursionPart(data.orgLevelByCoBo)
      this.loading = false
    } catch (error) {
      this.loading = false
      const errorObj = JSON.parse(JSON.stringify(error))
      if (errorObj.graphQLErrors[0].gerrType === 'NotFound') {
        this.orgApartArr = []
        this.partArr = []
        // this.departmentArr = []
      } else {
        this.orgApartArr = []
        this.partArr = []
        this.orgStaffArr = []
        // this.departmentArr = []
        this.$message({
          message: '请求数据失败了',
          type: 'error'
        })
      }
    }
  }
  // 递归重组数据
  public recursionPart(data: any): any[] {
    const array = []
    for (const iter of data) {
      if (iter.children.length > 0) {
        array.push({
          label: iter.label,
          value: iter.value,
          children: this.recursionPart(iter.children)
        })
      } else {
        array.push({
          label: iter.label,
          value: iter.value
        })
      }
    }
    return array
  }
  /**
   * 获取企业部门员工信息
   */
  public async getList() {
    let levelId = []
    if (this.departmentArr.length === 0) {
      levelId.push(this.message.orgCode)
    } else {
      levelId = this.departmentArr
    }
    try {
      const { data } = await this.$apollo.provider.clients.org.query({
        query: o.employeeByCoBo,
        variables: {
          token: this.$store.state.menu.token,
          pageNo: this.listQuery.page,
          pageSize: this.listQuery.limit,
          levelId,
          companyNo: this.lesseeKey !== '' ? '' : this.def
        },
        fetchPolicy: 'network-only'
      })
      this.listLoading = false
      const adata = JSON.parse(JSON.stringify(data))
      this.orgStaffArr = data.employeeByCoBo.pageRows
      // this.departmentArr = []
      this.pageTotalRows = adata.employeeByCoBo.pageTotalRows
    } catch (error) {
      this.listLoading = false
      const errorObj = JSON.parse(JSON.stringify(error))
      if (errorObj.graphQLErrors[0].gerrType === 'NotFound') {
        this.orgStaffArr = []
        // this.departmentArr = []
      } else {
        this.orgStaffArr = []
        // this.departmentArr = []
        this.$message({
          message: '请求数据失败了',
          type: 'error'
        })
      }
    }

    // this.loading = false
  }
  public handleItemChange(value: any) {
    this.form.selectedOptions = value
    this.dialogStatus = 'getComApartList'
  }
  public handleCurrentChange(val: any) {
    this.listQuery.page = val
    this.getList()
  }
  public nextText() {
    this.active--
  }
  public next() {
    if (this.active++ > 2) { this.active = 0 }
  }
  public handleCreate() {
    this.resetTemp()
    this.dialogStatus = 'create'
    this.dialogFormVisible = true
  }
  public handleUpdate(row: any) {
    this.resetTemp()
    this.form.eePhone = row.eePhone
    this.form.postalAddr = row.postalAddr
    this.form.eeName = row.eeName
    this.form.eeId = row.eeId
    this.form.levelId = row.levels ? JSON.parse(row.levels) : []
    this.dialogStatus = 'update'
    this.dialogFormVisible = true
  }
  // 添加
  public create(formName: string) {
    this.$refs[formName].validate(async (valid: boolean) => {
      if (valid) {
        this.listLoading = true
        this.listQuery.page = 1
        try {
          const levels = this.form.levelId.map((item: any) => item)
          const res = this.$apollo.provider.clients.org
            .mutate({
              mutation: o.newEmployeeByCoBo,
              variables: {
                token: this.$store.state.menu.token,
                employeeByCoBo: {
                  // levelName: this.res.leclName,
                  levels: JSON.stringify(this.form.levelId),
                  levelId: levels.pop(),
                  eePhone: this.form.eePhone,
                  postalAddr: this.form.postalAddr,
                  eeName: this.form.eeName
                },
                companyNo: this.lesseeKey !== '' ? '' : this.def
              }
            })
            .then((resp: any) => {
              const adata = resp.data
              if (adata !== null) {
                this.resetTemp()
                this.dialogFormVisible = false
                this.getList()
              } else {
                alert(resp.errors.message)
              }
            }).catch((err: any) => {
              if (err.message === 'GraphQL error: Data for the same primary key exist') {
                this.$message({
                  message: '存在相同的连接地址',
                  type: 'warning'
                })
              } else {
                this.$message({
                  message: '添加失败啦1',
                  type: 'error'
                })
              }
            })
        } catch (error) {
          this.$message({
            message: '添加失败啦2',
            type: 'error'
          })
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
  // 删除信息
  public deletes(row: any) {
    this.listLoading = true
    this.listQuery.page = 1
    this.$apollo.provider.clients.org.mutate({
      mutation: o.delEmployeeByCoBo,
      variables: {
        token: this.$store.state.menu.token,
        eeId: [row.eeId],
        companyNo: this.lesseeKey !== '' ? '' : this.def
      }
    }
    ).then((res: any) => {
      const adata = res.data
      if (adata !== null) {
        if (adata.delEmployeeByCoBo) {
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
  public cancel() {
    this.dialogFormVisible = false
    this.$refs.form.resetFields()
  }
  // 修改
  public update(form: any) {
    this.$refs[form].validate((params: boolean) => {
      if (!params) {
        this.$message({
          message: '请按规则填写',
          type: 'warning'
        })
        return false
      } else {
        const levels = this.form.levelId.map((item: any) => item)
        this.$apollo.provider.clients.org
          .mutate({
            mutation: o.editEmployeeByCoBo,
            variables: {
              token: this.$store.state.menu.token,
              employeeByCoBo: {
                eeId: this.form.eeId,
                eePhone: this.form.eePhone,
                postalAddr: this.form.postalAddr,
                eeName: this.form.eeName,
                levelId: levels.pop(),
                levels: JSON.stringify(this.form.levelId)
              },
              companyNo: this.lesseeKey !== '' ? '' : this.def
            }
          })
          .then((res: any) => {
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
              this.$message({
                message: '提交失败啦',
                type: 'error'
              })
            }
          })
      }
    })
  }
  public resetTemp() {
    this.form = {
      levelId: undefined,
      eeId: undefined,
      eeName: undefined,
      eePhone: undefined,
      postalAddr: undefined
    }
  }
  // 部门选择
  public async clickSpan(node: any) {
    const children = [node.data.value]
    // 还原添加的dom节点
    this.dialogFormVisible = false
    if (this.departmentArr.length > 0 && this.departmentArr.indexOf(node.data.value) !== -1) {
      return
    }
    this.departmentArr = children
    this.listQuery.page = 1
    await this.getList()
  }
  public getNodeData(data: any) {
    alert('getNodeData')
  }
  /**
   * 返回父级菜单
   */
  public rollback() {
    console.log(this.$parent)
    this.$parent.staffShow = true
  }
  @Watch('pageTotalRows')
  private wPageTotalRows() {
    this.total = this.pageTotalRows
  }
}
</script>

<style lang="scss" scoped>
.input-disable-custom .el-form-item__content .el-input__inner {
  border: 1px solid rgba(64, 158, 255, 0.2);
}
.custom-tree-container {
  position: relative;
}
.filter-Item {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 300;
}
.input-disable-custom
  .el-form-item__content
  .el-input.is-disabled
  .el-input__inner {
  background-color: #fff;
  border: 1px solid rgba(2, 10, 19, 0.2);
  color: #606266;
  cursor: default;
}
.input-disable-custom .el-form-item.is-success .el-input__inner {
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.input-disable-custom .el-form-item.is-error .el-input__inner {
  border-color: #f56c6c;
}

.input-disable-custom .el-form-item.is-required .el-form-item__label:before {
  content: '';
}

.input-disable-custom .el-form-item__content .el-card {
  background-color: #fff;
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: #606266;
}

.custom-tree-container {
  display: flex;
  flex-direction: row;
  el-button {
    z-index: 99;
  }
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  display: table;
  content: '';
}
.clearfix:after {
  clear: both;
}

.box-card-left {
  width: 650px;
}

.box-card-right {
  width: 480px;
}
</style>
