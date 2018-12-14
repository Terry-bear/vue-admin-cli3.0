<template>
  <div>
    <div style="overflow:auto;">
      <back-btn :cancle="cancle"></back-btn>
    </div>
    <div class="executor-add-main">
      <h3 style="margin-left: 24px;padding-top:16px;font-size: 16px;color:rgba(0,0,0,0.85);">添加执行人</h3>
      <div style="height: 1px;background-color: rgba(233,233,233,1);margin-bottom: 28px"></div>
      <div style="padding-bottom: 30px">
        <el-form v-loading="loading" :model="executorForm" :rules="rules" ref="form" label-position="left" label-width="130px" style="width: 544px; margin: auto;">
          <el-form-item label="姓名:" prop="executorName">
            <el-input v-model="executorForm.executorName" placeholder="请输入姓名"></el-input>
          </el-form-item>
          <el-form-item label="身份证号:" prop="executorId">
            <el-input v-model="executorForm.executorId" placeholder="请输入身份证号"></el-input>
          </el-form-item>
          <el-form-item label="电话:" prop="executorPhone">
            <el-input v-model="executorForm.executorPhone" placeholder="请输入电话号码"></el-input>
          </el-form-item>
          <el-form-item label="账号状态:">
            <span style="margin-left: 15px;margin-right: 8px;">{{executorForm.executorSwitch | executorStatusString}}</span>
            <el-switch v-model="executorForm.executorSwitch" active-color="#3F9EFF" inactive-color="#b7b9bb" class="switch-style"></el-switch>
          </el-form-item>
          <el-form-item label="头像:" prop="executorPicture" class="clear-must">
            <div style="display:flex;flex-direction:row;">
              <executor-picture :pictureUrl="executorForm.executorPicture" ref="imgUpload" />
            </div>
          </el-form-item>
          <el-form-item label="负责村:" class="select-area">
            <div class="area" v-for="item in executors" :key="item.id">
              <executor-area :index="item.id" :areaName="item.areaName" ref="executorArea" :value="item" @closeAll="closeAll" @onChange="onChange" />
              <span v-if="executors.length > 1" class="delete" @click="handleDelete(item.id)">一</span>
              <span v-if="item.complete" style="position:absolute;line-height: 20px;color: #f56c6c;font-size: 12px;">{{item.errorContent}}</span>
            </div>
          </el-form-item>
          <button class="btn" @click.prevent="AddExecute">
            <span v-if="this.executors.length < areaLength">+&nbsp;添加 ({{this.executors.length}}/ {{this.areaLength}})</span>
            <span v-else style="color: red;" :disabled="true">+&nbsp;添加 ({{this.executors.length}}/ {{this.areaLength}})</span>
          </button>
          <el-form-item>
            <div style="padding-right: 120px;margin-top:20px;" class="">
              <el-button type="primary" @click="submits()" size="small">提 交</el-button>
              <el-button @click="cancle()" size="small">返 回</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
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
import BackBtn from '@/components/BackBtn.vue'
import { deflate } from 'zlib'
const REGEX_CHINESE = /[\u4e00-\u9fa5]/
const REGEX_ID_CARD = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
interface ExcutorType {
  '1': string
  '0': string
  'true': string
  'false': string
  [propName: string]: any
}
@Component({
  components: {
    executorPicture,
    executorArea,
    BackBtn
  },
  filters: {
    executorStatusString(arg: any) {
      arg = arg.toString()
      const executorStatus: ExcutorType = {
        1: '启用',
        0: '停用',
        true: '启用',
        false: '停用'
      }
      return executorStatus[arg]
    }
  }
})
export default class AddExecutor extends mixins(TableMixin, ExtVue, ValidMixin) {
  private executors!: any[]
  private areaLength!: number
  private executorForm: any
  public data() {
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
    // 验证是否包含中文字符
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
    return {
      loading: false,
      executorForm: {
        executorName: '',
        executorId: '',
        executorPhone: '',
        executorSwitch: true,
        executorPicture: ''
      },
      switchState: false,
      rules: {
        executorName: [
          { required: true, message: '请输入姓名', trigger: 'blur' },
          { required: true, validator: checkChinese, trigger: 'blur' }
        ],
        executorId: [
          { required: true, message: '请输入身份证号码', trigger: 'blur' },
          { min: 17, max: 18, validator: checkIdCard, trigger: 'blur' }
        ],
        executorPhone: [
          { required: true, validator: checkPhoneNum, trigger: 'blur' }
        ]
      },
      areaLength: 5,
      executors: [
        { areaCode: '', areaName: '', id: this.getTime(), complete: false, errorContent: '' }
      ]
    }
  }
  public cancle() {
    this.$emit('changeAddExecutor', false)
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
  public onChange(obj: any, index: number) {
    for (const values of this.executors) {
      if (obj.areaCode && values.areaCode === obj.areaCode) {
        this.$message({
          message: '该执行村已经存在，请重新选择',
          type: 'error'
        })
        for (const val of this.executors) {
          if (val.id === index) {
            val.areaName = '@清空'
          }
        }
        return
      } else if (values.id === index) {
        if (obj.areaCode && obj.areaCode !== '') {
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
  public AddExecute() {
    if (this.executors.length === this.areaLength) {
      return
    }
    this.executors.push({ areaCode: '', areaName: '', errorContent: '', complete: false, id: this.getTime() })
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
            item.errorContent = '请选择完整信息'
            item.complete = true
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
        let picUrls = ''
        await this.$refs.imgUpload.upLoadFile()
        if (this.$refs.imgUpload.urls.length > 0) {
          picUrls = this.$refs.imgUpload.urls[0]
        }
        const areaList: any[] = []
        await this.executors.map((item) => {
          if (item.areaCode !== '' && item.areaName !== '') {
            areaList.push({ areaCode: item.areaCode, areaName: item.areaName })
          }
        })
        const inputExecutorData = {
          name: this.executorForm.executorName,
          idCard: this.executorForm.executorId,
          mobileNo: this.executorForm.executorPhone,
          executorStatus: this.executorForm.executorSwitch ? 1 : 0,
          userPic: picUrls,
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
            message: '添加成功~',
            type: 'success'
          })
          setTimeout(() => {
            this.loading = false
            this.$emit('changeAddExecutor', false)
            this.$parent.$apollo.queries.executorByCoBo.refetch()
          }, 250)
        } catch (error) {
          const message = JSON.parse(JSON.stringify(error)).message
          let errorInfo = '添加失败了~'
          if (message.includes('IdCard')) {
            errorInfo = '身份证号码错误！'
          } else if (message.includes('idCard exists')) {
            errorInfo = '该身份证号码已经存在！'
          } else if (message.includes('mobileNo exists')) {
            errorInfo = '该电话号码已经存在！'
          } else if (message.includes('same primary key exist')) {
            errorInfo = '该村已存在执行人!'
          }
          this.$message({
            message: errorInfo,
            type: 'error'
          })
          this.loading = false
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.executor-add-main {
  background-color: #fff;
  margin: 0 25px;
}
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
  margin-left: 130px;
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
</style>

<style>
.executor-add-main .el-form-item__label:before {
  content: '*';
  color: #f56c6c;
  margin-right: 4px;
}
.executor-add-main .el-form-item__label {
  text-align: right;
  padding-left: 15px;
}
.executor-add-main .el-form-item {
  margin-bottom: 18px;
}
.executor-add-main .el-form-item input {
  width: 346px;
  height: 32px;
}
.executor-add-main .img_group {
  margin-left: 10px !important;
  width: 350px;
}
.executor-add-main .img_group p {
  margin-top: 8px !important;
}
.select-area .el-form-item__content {
  width: 310px;
}
.select-area .el-form-item__content input {
  width: 300px;
}
.executor-add-main .switch-style input {
  width: 50px !important;
}
</style>
