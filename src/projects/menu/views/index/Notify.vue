<template>
  <div>
    <div v-if="!detailStatus">
      <div class="content-wrapper">
        <div class="noti-table" :style="adaptWidth">
          <div class="content-msg">
            <div class="content-msg-left">
              <el-radio-group v-model="currMsgType" @change="selMsgType" size="small">
                <el-radio-button :label="BACKLOG_MSG">待办消息</el-radio-button>
                <el-radio-button :label="SYS_READ">系统消息</el-radio-button>
                <el-radio-button :label="ALL_MSG">全部类型消息</el-radio-button>
              </el-radio-group>
            </div>
            <div class="content-msg-right">
              <el-button size="mini" type="primary" @click="hadReadAll()" :disabled="messageIds.length === 0">一键已读
              </el-button>
              <el-button size="mini" type="primary" @click="deletes()" :disabled="messageIds.length === 0">删除
              </el-button>
            </div>
          </div>
          <el-table ref="multipleTable" v-loading="$apollo.loading" height="490" :data="listData" tooltip-effect="dark" style="width: 96%" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column label="标题内容" width="520">
              <template slot-scope="scope">
                <span v-show="scope.row.messageStauts === 1">
                  <font color="#F5222D" size=3>● </font>
                </span>
                <span v-show="scope.row.messageStauts === -1">
                  <font color="#F5222D" size=3>&nbsp;&nbsp; </font>
                </span>
                <a @click="goDetail(scope.row)" class="title-content-info">{{ scope.row.title }}</a>
                &emsp;
                <el-tag :type="scope.row.messageWeight | fMessageWeight(true)" v-show="scope.row.messageStauts === 1" size="mini">{{scope.row.messageWeight | fMessageWeight(false)}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="提交时间" width="220">
              <template slot-scope="scope">{{ scope.row.createTime.substring(0, scope.row.createTime.length - 2) }}</template>
            </el-table-column>
            <el-table-column label="类型" show-overflow-tooltip>
              <template slot-scope="scope">{{ scope.row.messageType }}</template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="footer-info">
            <div class="footer-left">
              <!-- <el-checkbox v-model="btmSelectAll"></el-checkbox> -->
            </div>
            <div class="footer-right">
              <el-pagination @size-change="handleSizeChange" background @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10]" :page-size="listQuery.limit" layout="total, sizes, prev, pager, next, jumper" :total="total">
              </el-pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
    <notify-detail v-if="detailStatus" :currData="currData" :detailStatus="detailStatus" @detailStatus="detailStatus = $event" @currMsgType="currMsgType = $event" @key="key = $event" @pageNo="listQuery.page=$event"></notify-detail>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import { Mutation, State, Getter, Action } from 'vuex-class'
import * as m from '@/projects/menu/graphql/message.gql'
import '@/projects/menu/assets/scss/rh_table.scss'
import TableMixin from 'mixin/TableMixin.ts'
import ExtVue from 'mixin/ExtVue.ts'
import { mapMutations, mapActions } from 'vuex'
import notifyDetail from './notifyDetail.vue'

Vue.filter('fMessageWeight', function(msgWeight: string, vOrL: any) {
  const msgObj = { value: '', label: '' }
  switch (msgWeight) {
  case '1':
    msgObj.value = ''
    msgObj.label = '一般'
    break
  case '2':
    msgObj.value = 'warning'
    msgObj.label = '重要'
    break
  case '3':
    msgObj.value = 'danger'
    msgObj.label = '紧急'
    break
  }
  return vOrL ? msgObj.value : msgObj.label
  })
@Component({
  components: {
    notifyDetail
  },
  apollo: {
    $client: 'message',
    $loadingKey: 'loading',
    messageByCoBo() {
      return {
        query: m.messageByCoBo,
        variables() {
          return {
            token: this.$store.state.menu.token,
            pageNo: this.listQuery.page,
            pageSize: this.listQuery.limit,
            key: this.key
          }
        },
        result({ data, loading }) {
          // this.updateCount ++
          if (!loading) {
            if (data.messageByCoBo !== undefined) {
              this.listData = data.messageByCoBo.pageRows
              this.total = data.messageByCoBo.pageTotalRows
            }
          }
        },
        error(error) {
          if (JSON.parse(JSON.stringify(error)).graphQLErrors[0].gerrType === 'NotFound') {
            this.listData = []
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
        fetchPolicy: 'cache-and-network'
      }
    }
  }
})
export default class Notify extends mixins(TableMixin, ExtVue) {
  @Mutation('setMainContentUrl') public setMainContentUrl: any
  @Action('editmessageByCoBo') public editmessageByCoBo: any
  private messageIds!: string[]
  private typeArr!: string[]
  private currData!: any
  private detailStatus!: any
  private currMsgType!: any
  private ALL_MSG!: string
  private BACKLOG_MSG!: string
  private SYS_READ!: string
  private key!: string
  public data() {
    return {
      // ?typeStyle
      ALL_MSG: 'all',
      BACKLOG_MSG: 'backlog_msg',
      SYS_READ: 'sys_read',
      currMsgType: 'all',
      typeArr: [
        '',
        'info',
        'info'
      ],
      btmSelectAll: false,
      detailStatus: false,
      key: '',
      listQuery: {
        page: 1,
        limit: 10
      },
      listData: [],
      currData: {},
      messageIds: [],
      total: 1,
      loading: false
    }
  }
  public mounted() {
    if (window.location.href.match(/.+messageId=(\w+)/) !== null) {
      this.goDetail({ messageId: (window as any).location.href.match(/.+messageId=(\w+)/)[1] })
    }
  }
  public async hadReadAll() {
    console.log(this.messageIds)
    const MessageIds = this.messageIds
    const temp = await this.editmessageByCoBo(MessageIds)
    Object.keys(temp).forEach((params) => {
      if (params !== 'data') {
        this.$message({
          type: 'warning',
          message: '操作失败'
        })
      }
    })
    await this.$apollo.queries.messageByCoBo.refetch()
  }
  public deletes() {
    (this as any).$confirm(`你确定要删除这<font color="red">${this.messageIds.length}</font>条信息吗?`, '删除', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定',
      type: 'warning'
    }).then(async () => {
      const { data } = await this.$apollo.provider.clients.message.mutate({
        mutation: m.delmessageByCoBo,
        variables: {
          token: this.$store.state.menu.token,
          messageIds: this.messageIds
        }
      })
      await this.$apollo.queries.messageByCoBo.refetch()
      this.typeArr = ['', 'info', 'info']
    }).catch((params: any) => {
      console.log()
    })
  }
  public async goDetail(row: any) {
    // ?确定已读 messageStauts ===  1是未读
    const { data } = await this.$apollo.provider.clients.message.query({
      query: m.messageByCoBoById,
      variables: {
        token: this.$store.state.menu.token,
        messageId: row.messageId
      },
      fetchPolicy: 'network-only'
    })
    this.currData = data.messageByCoBoById
    this.detailStatus = true
  }
  public handleSelectionChange(e: any) {
    const msgIds: string[] = []
    e.forEach((params: any) => {
      msgIds.push(params.messageId)
    })
    this.messageIds = msgIds
  }
  public async handleCurrentChange(val: any) {
    this.selMsgType(this.currMsgType, val)
  }
  public async selMsgType(arg: any, page = 1) {
    this.listQuery.page = page
    const type = this.currMsgType
    switch (type) {
      case this.ALL_MSG:
        this.key = ''
        await this.$apollo.queries.messageByCoBo.refetch()
        break
      case this.BACKLOG_MSG:
        // todo informType=1 待办
        this.key = 'informType=1'
        this.$apollo.queries.messageByCoBo.refetch()
        break
      case this.SYS_READ:
        // todo informType=0 系统
        this.key = 'informType=0'
        this.$apollo.queries.messageByCoBo.refetch()
        break
    }
  }
}
</script>

<style lang="scss">
.content-wrapper {
  display: flex;
}
.noti-table {
  background-color: #fff;
  margin: 24px;
  padding: 24px;
  .el-table.el-table--fit.el-table--enable-row-hover {
    // background-color: #f00;
    height: 475px;
    // !--------------------------
    .el-table__body-wrapper,
    .el-table__footer-wrapper,
    .el-table__header-wrapper {
      // display: block;
      .el-table__empty-block {
        background-image: url('../../assets/listNoData.png');
        background-repeat: no-repeat;
        background-position-x: 50%;
        background-position-y: 30%;
        background-size: 160px;
        // background-color: #0ff;
        height: 475px;
        span {
          padding-top: 100px;
          font-size: 14px;
          color: #000;
        }
      }
    }
  }
}

.content-msg {
  margin: {
    top: 10px;
    bottom: 10px;
    left: 30px;
    right: 30px;
  }
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.title-content-info {
  cursor: pointer;
  text-decoration: none;
  color: gray;
  &:hover {
    color: #007eef;
    text-decoration: underline;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
  }
}
.footer-info {
  margin-top: 15px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .footer-left {
    margin-left: 14px;
    button {
      margin-left: 20px;
    }
  }
  .footer-right {
    margin-right: 25px;
  }
}
</style>
