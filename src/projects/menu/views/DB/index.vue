<template>
  <div class="db_con">
    <div class="db_box_con" v-loading="DBLoading">
      <div class="db_head">
        <div>
          <span>数据库名</span>
          <div style="width: 65%">
            <el-input size="small" placeholder="请输入数据库名" clearable v-model="DBName"></el-input>
          </div>
          <el-button size="small" type="primary" @click="_getDate">查 询</el-button>
        </div>
        <div>
          <el-button size="small" @click="addDialog = true">添 加</el-button>
          <el-button size="small" type="primary" @click="handledCopy">自动备份</el-button>
        </div>
      </div>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column
          type="index"
          label="序号">
        </el-table-column>
        <el-table-column
          prop="DBName"
          label="数据库名">
        </el-table-column>
        <el-table-column
          prop="flag"
          label="数据库标识">
        </el-table-column>
        <el-table-column
          prop="Api"
          label="接入API">
        </el-table-column>
        <el-table-column
          prop="time"
          label="上次备份时间">
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.type">
            </el-switch>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page="page.page"
        layout="total, prev, pager, next, jumper"
        style="margin-top: 20px;text-align: right"
        :total="page.total">
      </el-pagination>
      <el-dialog
        :visible.sync="addDialog"
        width="30%"
        :before-close="handleCloseDia">
        <div class="hos_dialog" style="text-align: center">
          <p>您还不具备添加的权限</p>
          <el-button size="small" type="primary" @click="addDialog = false">确定</el-button>
        </div>
      </el-dialog>
      <el-dialog
        :visible.sync="switchDia"
        width="30%"
        :before-close="handleswitchDia">
        <div class="hos_dialog" style="text-align: center">
          <p>是否确认停用</p>
          <div style="margin-top:20px;text-align: center">
            <el-button size="small" @click="switchDia = false">取消</el-button>
            <el-button size="small" type="primary" @click="switchDia = false">确定</el-button>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
@Component({})
export default class Index extends mixins(ExtVue) {
  private DBName!: string
  private DBLoading!: boolean
  private addDialog!: boolean
  private switchDia!: boolean
  private tableData: any
  private copyTable: any
  public data() {
    return {
      page: {
        page: 1,
        total: 5
      },
      DBName: '',
      DBLoading: true,
      addDialog: false,
      switchDia: false,
      copyTable: [
        {
          DBName: '工地实名制数据库-1',
          flag: 'gd101',
          Api: '10.174.2.251',
          time: '2018-09-08',
          type: true
        },
        {
          DBName: '工地实名制数据库-2',
          flag: 'gd102',
          Api: '10.174.2.36',
          time: '2018-09-08',
          type: false
        },
        {
          DBName: '卫计委实名数据库',
          flag: 'wj101',
          Api: '10.174.2.101',
          time: '2018-09-08',
          type: true
        },
        {
          DBName: '劳动力服务数据库-1',
          flag: 'ldl01',
          Api: '10.174.2.39',
          time: '2018-09-08',
          type: true
        },
        {
          DBName: '劳动力服务数据库-2',
          flag: 'ldl02',
          Api: '10.174.2.221',
          time: '2018-09-08',
          type: true
        }
      ],
      tableData: []
    }
  }
  public mounted() {
    let tempSTI = 0
    const stiVal = setInterval(() => {
      tempSTI++
      if (tempSTI > 1) {
        this._getDate()
        clearInterval(stiVal)
      }
    }, 1000)
  }
  public _getDate() {
    const table = []
    if (this.DBName === '') {
      this.tableData = this.copyTable
      this.DBLoading = false
    } else {
      for (const iter of this.copyTable) {
        if (iter.DBName.search(this.DBName) !== -1) {
          table.push(iter)
        }
      }
      this.tableData = table
      this.DBLoading = false
    }
  }
  public handleCloseDia() {
    this.addDialog = false
  }
  public handleswitchDia() {
    this.switchDia = false
  }
  public handledCopy() {
    let tempSTI = 0
    const stiVal = setInterval(() => {
      tempSTI++
      if (tempSTI > 2) {
        this.$message.success('数据备份成功，备份时间' + new Date())
        clearInterval(stiVal)
      }
    }, 1000)
  }
}
</script>

<style lang="scss">
.db_con{
  padding: 24px;
  height: 100%;
  font-size: 14px;
  background-color: #e9e9e9;
  box-sizing: border-box;
}
.db_box_con{
  background-color: #ffffff;
  height: 100%;
  padding: 10px;
  box-sizing: border-box;
}
.db_head{
  height: 40px;
  margin-bottom: 20px;
  line-height: 40px;
  >div{
    display: inline-block;
    vertical-align: middle;
    width: 49.5%;
    &:nth-child(1){
      >span,>div{
        display: inline-block;
        vertical-align: middle;
      }
    }
  }
}
</style>
