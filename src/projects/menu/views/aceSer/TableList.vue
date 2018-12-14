<template>
  <div>
    <el-table :key='tableKey' :data="lists" v-loading="listLoading" :max-height="maxHeight" element-loading-text="给我一点时间" fit highlight-current-row style="width: 99%">
      <el-table-column align="center" :label="AUTHORIZEID">
        <template slot-scope="scope">
          <span>{{scope.row.authorizeId}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="SERVERNO">
        <template slot-scope="scope">
          <span v-html="fmtData(scope.row.serverNo)"></span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="SERVERNAME">
        <template slot-scope="scope">
          <span v-html="fmtData(scope.row.serverName)"></span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="GROUPID" show-overflow-tooltip>
        <template slot-scope="scope">
          <span>{{scope.row.groupId}} </span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="GROUPNAME">
        <template slot-scope="scope">
          <span v-html="fmtData(scope.row.groupName)"></span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="UPDATETIME">
        <template slot-scope="scope">
          <span>{{ scope.row.createTime | formatDate}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="CREATETIME">
        <template slot-scope="scope">
          <span>{{scope.row.updateTime | formatDate}}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" :label="OPT" width="200">
        <template slot-scope="scope">
          <el-button size="small" type="danger" @click="deletes(scope.row)">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import ExtVue from 'mixin/ExtVue'
import TableMixin from 'mixin/TableMixin'
import * as label from '@/projects/menu/assets/js/label-type.ts'
import SearchPro from '@/utils/SearchPro.ts'

@Component({})
export default class TableList extends mixins(ExtVue, TableMixin) {
  @Prop() private list: any
  @Prop() private listLoading!: boolean
  @Prop() private filterServerName: any
  public data() {
    return {
      loading: false,
      maxHeight: 1,
      tableKey: 0,
      AUTHORIZEID: label.TO_AUTHORIZEID,
      SERVERNO: label.TO_SERVERNO,
      SERVERNAME: label.TO_SERVERNAME,
      GROUPID: label.TO_GROUPID,
      GROUPNAME: label.TO_GROUPNAME,
      UPDATETIME: label.TO_UPDATETIME,
      CREATETIME: label.TO_CREATETIME,
      OPT: label.TO_OPT
    }
  }

  public get lists(): string {
    const searchPro: any = new SearchPro(this.list, this.filterServerName)
    return searchPro.fmtLists()
  }
  public deletes(row: any) {
    this.$parent.deletes(row)
  }
  public fmtData(val: string) {
    const searchPro = new SearchPro(this.list, this.filterServerName)
    return searchPro.fmtData(val)
  }
}
</script>

<style scoped>
</style>
