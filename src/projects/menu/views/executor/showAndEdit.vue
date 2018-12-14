<template>
  <div>
    <el-dialog :title="isEdit ? '编辑执行人信息' : '查看执行人信息' " :visible.sync="isShowOrEdit" :before-close="cancleBtn" width="544px" class="executor-edit-m">
      <el-form v-loading="loading" :model="showObj" :rules="rules" ref="form" label-position="left" label-width="140px">
        <el-form-item label="姓名:" prop="name">
          <el-input v-model="showObj.name" v-if="isEdit" placeholder="请输入姓名"></el-input>
          <span class="show-executor-info" v-else>{{showObj.name}}</span>
        </el-form-item>
        <el-form-item label="身份证号:" prop="idCard">
          <el-input v-model="showObj.idCard" v-if="isEdit" placeholder="请输入身份证号"></el-input>
          <span class="show-executor-info" v-else>{{showObj.idCard | hideMiddle}}</span>
        </el-form-item>
        <el-form-item label="电话:" prop="mobileNo">
          <el-input v-model="showObj.mobileNo" v-if="isEdit" placeholder="请输入电话号码"></el-input>
          <span class="show-executor-info" v-else>{{showObj.mobileNo}}</span>
        </el-form-item>
        <el-form-item label="账号状态:">
          <div v-if="isEdit">
            <span style="margin-left: 15px;margin-right: 8px;">{{switchState | executorStatusString}}</span>
            <el-switch v-model="switchState" active-color="#3F9EFF" inactive-color="#b7b9bb" class="switch-style"></el-switch>
          </div>
          <span class="show-executor-info" v-else>{{showObj.executorStatus | executorStatusString}}</span>
        </el-form-item>
        <el-form-item label="头像:" prop="executorPicture" class="clear-must">
          <div v-if="!isEdit">
            <img style="width: 96px; height: 102px;" :src="showObj.userPic" v-if="showObj.userPic">
            <div style="display:flex;flex-direction:row; position: relative;width: 96px;height: 102px;background-color: rgb(212, 215, 217);" v-else>
              <svg-icon icon-class="users" style="width:96px; height:102px;position: absolute; top: 0; z-index: 1;"></svg-icon>
            </div>
          </div>
          <div style="display:flex;flex-direction:row; position: relative;width: 96px;height: 102px;background-color: rgb(212, 215, 217);" v-else>
            <svg-icon icon-class="users" style="width:96px; height:102px;position: absolute; top: 0; z-index: 1;"></svg-icon>
            <executor-picture :pictureUrl="pictureUrl" ref="imgUpload" />
          </div>
        </el-form-item>
        <el-form-item label="负责村:" class="select-area">
          <div v-if="!isEdit">
            <p class="show-executor-info show-executor-info-area" style="margin: 0" v-for="item in showObj.areaList" :key="item.areaCode">{{item.areaName}}</p>
          </div>
          <div v-else class="area" v-for="item in executors" :key="item.id">
            <executor-area :index="item.id" :areaName="item.areaName" ref="executorArea" :value="item" @closeAll="closeAll" @onChange="onChange" />
            <span v-if="executors.length > 1" class="delete" @click="handleDelete(item.id)">一</span>
            <span v-if="item.complete" style="position:absolute;line-height: 20px;color: #f56c6c;font-size: 12px;">{{item.errorContent}}</span>
          </div>
        </el-form-item>
        <button v-if="isEdit" class="btn" @click.prevent="AddExecute">
          <span v-if="this.executors.length < areaLength">+&nbsp;添加 ({{this.executors.length}}/ {{this.areaLength}})</span>
          <span v-else style="color: red;" :disabled="true">+&nbsp;添加 ({{this.executors.length}}/ {{this.areaLength}})</span>
        </button>
        <el-form-item>
          <div v-if="isEdit" style="padding-right: 120px;margin-top:20px;" class="offer-edit-button-m">
            <el-button type="primary" @click="submits()" size="small">提 交</el-button>
          </div>
          <div v-else class="offer-edit-button-m">
            <el-button type="primary" @click="changeEditState()" size="small">编 辑</el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import TableMixin from 'mixin/TableMixin'
import ExtVue from 'mixin/ExtVue'
import ValidMixin from 'mixin/ValidMixin'
import '@/projects/menu/assets/scss/rh_table.scss'

import * as taskGql from '@/projects/menu/graphql/task.gql'
import executorArea from './component/executorArea.vue'
import executorPicture from './component/executorPicture.vue'

const REGEX_CHINESE = /[\u4e00-\u9fa5]/
const REGEX_ID_CARD = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/

@Component({
  components: {
    executorPicture,
    executorArea
  },
  filters: {
    executorStatusString(arg: any) {
      arg = arg.toString()
      interface ExcutorType {
        '1': string
        '0': string
        'true': string
        'false': string
        [propName: string]: any
      }
      const executorStatus: ExcutorType = {
        1: '启用',
        0: '停用',
        true: '启用',
        false: '停用'
      }
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
      for (const value of stringArr) {
        areaName += value
      }
      return areaName
    }
  }
})
export default class ShowAndEdit extends mixins(TableMixin, ExtVue) {
  @Prop() private showOrEditData: any
  @Prop() private isShowOrEdit!: boolean
  @Prop() private isEdit!: boolean
  private showObj: any
  private oldExecutorArea!: any[]
  private pictureUrl!: string
  private switchState!: boolean
  private executors!: any[]
  private areaLength!: number
  public data() {
    const checkChinese = (rule: any, value: any, callback: any) => {
      if (!REGEX_CHINESE.test(value)) {
        return callback(new Error('请包含中文字符'))
      } else {
        callback()
      }
    }
    // 验证身份证号
    const checkIdCard = (rule: any, value: any, callback: any) => {
      if (!REGEX_ID_CARD.test(value)) {
        return callback(new Error('请输入正确的身份证号'))
      } else {
        callback()
      }
    }
    const checkPhoneNum = (rule: any, value: any, callback: any) => {
      if (value === undefined || value === '') {
        return callback(new Error('请输入手机号码'))
      } else if (value === null || value.length !== 11) {
        return callback(new Error('手机号长度必须为11位'))
      } else if (!/^1\d{10}$/.test(value)) {
        return callback(new Error('手机号不正确'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      showObj: {},
      switchState: false,
      rules: {
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { required: true, validator: checkChinese, trigger: 'blur' }
        ],
        idCard: [
          { required: true, message: '请输入身份证号码', trigger: 'blur' },
          { min: 17, max: 18, validator: checkIdCard, trigger: 'blur' }
        ],
        mobileNo: [
          { required: true, validator: checkPhoneNum, trigger: 'blur' }
        ]
      },
      imgDate: [],
      imgLength: 1,
      pictureUrl: '',
      areaLength: 5,
      executors: [
        { areaCode: '', areaName: '', id: this.getTime(), complete: false, errorContent: '' }
      ],
      oldExecutorArea: []
    }
  }
  public created() {
    this.showObj = JSON.parse(JSON.stringify(this.showOrEditData))
    this.oldExecutorArea = this.showObj.areaList
    this.pictureUrl = this.showObj.userPic
    if (this.showObj.executorStatus) {
      this.switchState = true
    }
    if (this.isEdit) {
      const areaInfo = []
      for (const value of this.showObj.areaList) {
        areaInfo.push({ areaCode: value.areaCode, areaName: value.areaName, id: this.getTime(), complete: false, errorContent: '' })
      }
      this.executors = areaInfo
    }
  }
  public cancleBtn() {
    this.$emit('changeShowState', false)
  }
  public closeAll() {
    this.$refs.executorArea.map((item: any) => {
      item.handleDia()
    })
  }
  public getTime() {
    function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
    }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  }
  public async onChange(obj: any, index: number) {
    for (const values of this.executors) {
      if (obj.areaCode && values.areaCode === obj.areaCode) {
        this.$message({
          message: '该执行村已经选择，请重新选择',
          type: 'error'
        })
        for (const val of this.executors) {
          if (val.id === index) {
            val.areaName = '@清空'
          }
        }
        return
      } else if (values.id === index) {
        if (obj.areaCode !== '') {
          // 编辑以前就已经有这个村了 就不用再验证了
          let isVerification = true
          await this.oldExecutorArea.map((item) => {
            if (item.areaCode === obj.areaCode) {
              values.areaCode = obj.areaCode
              values.areaName = obj.areaName
              values.complete = false
              isVerification = false
            }
          })
          if (isVerification) {
            // 判断该村是否有联系人
            this.$apollo.provider.clients.task.query({
              query: taskGql.existAreaByCoBoByAreaCode,
              variables: {
                token: this.$store.state.menu.token,
                areaCode: obj.areaCode
              },
              fetchPolicy: 'network-only'
            }).then((data: any) => {
              if (data.data.existAreaByCoBoByAreaCode) {
                values.errorContent = '该村已经存在执行人，请重新选择'
                values.complete = true
                values.areaName = '@清空'
              } else {
                values.areaCode = obj.areaCode
                values.areaName = obj.areaName
                values.complete = false
              }
            }).catch((err: any) => {
              console.log('错误' + err)
            })
          }
        }
      }
    }
  }
  public AddExecute() {
    if (this.executors.length === this.areaLength) {
      return
    }
    this.executors.push({ areaCode: '', areaName: '', complete: false, id: this.getTime(), errorContent: '' })
  }
  public handleDelete(index: number) {
    if (this.executors.length === 1) {
      this.$message({
        message: '至少选择一个村',
        type: 'error'
      })
      return
    }
    for (let i = 0; i < this.executors.length; i++) {
      if (this.executors[i].id === index) {
        this.executors.splice(i, 1)
      }
    }
  }
  public changeEditState() {
    this.$emit('changeIsEdit', true)
  }
  public async submits() {
    await this.$refs.form.validate(async (vaild: boolean) => {
      if (vaild) {
        this.loading = true
        let isSubmit = false
        await this.executors.map((item) => {
          if (item.areaCode === '') {
            item.complete = true
            item.errorContent = '请选择完整信息'
            isSubmit = true
          }
        })
        if (isSubmit) {
          this.$message({
            message: '请选择完整村庄信息',
            type: 'error'
          })
          this.loading = false
          return false
        }
        let ThisPictureUrl = ''
        await this.$refs.imgUpload.upLoadFile()
        if (this.$refs.imgUpload.urls.length > 0) {
          ThisPictureUrl = this.$refs.imgUpload.urls[0]
        } else {
          ThisPictureUrl = this.showOrEditData.userPic
        }
        const areaList: any[] = []
        await this.executors.map((item) => {
          if (item.areaCode !== '' && item.areaName !== '') {
            areaList.push({ areaCode: item.areaCode, areaName: item.areaName })
          }
        })
        if (this.showObj.userId) {
          const inputExecutorData = {
            userId: this.showObj.userId,
            name: this.showObj.name,
            idCard: this.showObj.idCard,
            mobileNo: this.showObj.mobileNo,
            userPic: ThisPictureUrl,
            executorStatus: this.switchState ? 1 : 0,
            areaList
          }
          try {
            const res = await this.$apollo.provider.clients.task.mutate({
              mutation: taskGql.upOrAddExecutorByCoBo,
              variables: {
                token: this.$store.state.menu.token,
                inputExecutor: inputExecutorData
              }
            })
            this.$message({
              message: '修改成功~',
              type: 'success'
            })
            setTimeout(() => {
              this.loading = false
              this.$emit('changeShowState', false)
              this.$parent.$apollo.queries.executorByCoBo.refetch()
            }, 250)
          } catch (error) {
            const message = JSON.parse(JSON.stringify(error)).message
            let errorInfo = '修改失败了~'
            if (message.includes('IdCard')) {
              errorInfo = '身份证号码错误！'
            } else if (message.includes('idCard exists')) {
              errorInfo = '该身份证号码已经存在！'
            } else if (message.includes('mobileNo exists')) {
              errorInfo = '该电话号码已经存在！'
            } else if (message.includes('No right to modify the userId')) {
              errorInfo = '无权操作该执行人'
            }
            this.$message({
              message: errorInfo,
              type: 'error'
            })
            this.loading = false
          }
        }
        this.$parent.$apollo.queries.executorByCoBo.refetch()
      }
    })
  }
  get strUrlsToArr() {
    return this.showObj.mienPicUrl ? JSON.parse(this.showObj.mienPicUrl) : ['']
  }
  @Watch('isEdit')
  private WisEdit(data: any) {
    if (data) {
      const areaInfo = []
      for (const val of this.showObj.areaList) {
        areaInfo.push({ areaCode: val.areaCode, areaName: val.areaName, id: this.getTime(), complete: false, errorContent: '' })
      }
      this.executors = areaInfo
    }
  }
}
</script>
<style lang="scss" scoped>
.delete {
  position: absolute;
  right: -30px;
  top: 10px;
  line-height: 18px;
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  text-align: center;
  border: 1px solid rgba(0, 0, 0, 0.65);
}
.area {
  position: relative;
  margin-bottom: 20px;
}
.btn {
  width: 340px;
  height: 32px;
  margin-left: 140px;
  border: 1px dashed #b7b2b2;
  background: none;
  border-radius: 5px;
  &:focus {
    outline: none;
  }
  &:hover {
    cursor: pointer;
  }
}
.executor-edit-m .show-executor-info {
  color: rgba(0, 0, 0, 0.65);
}
.executor-edit-m .show-executor-info-area {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 346px;
}
</style>

<style lang="scss">
.el-dialog {
  margin-top: 54px !important;
}
.executor-edit-m .el-dialog .el-dialog__header {
  border-bottom: 1px solid #e9e9e9 !important;
  padding: 10px 20px 10px 20px !important;
  background-color: #fafafa;
}
.executor-edit-m .el-dialog .el-dialog__header span {
  font-size: 14px;
  color: #000000;
}
.executor-edit-m .el-dialog__body {
  padding: 20px;
}
.executor-edit-m .el-form-item label {
  width: 150px;
  text-align: right;
}
.executor-edit-m .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
.executor-edit-m .el-form-item {
  margin-bottom: 18px;
}
.executor-edit-m .el-form-item input {
  width: 346px;
  height: 32px;
}
.executor-edit-m .img_group {
  margin-left: 0 !important;
  z-index: 5;
  width: 350px;
}
.executor-edit-m .img_group p {
  margin-top: 8px !important;
}
.select-area .el-form-item__content {
  width: 310px;
}
.select-area .el-form-item__content input {
  width: 300px;
}
.executor-edit-m .switch-style input {
  width: 50px !important;
}
</style>
