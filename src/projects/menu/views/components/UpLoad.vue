<template>
  <div>
    <div v-if="picSrcArr !== null">
      <label v-for="pS in picSrcArr" :key="pS.idx" class="imgG">
        <img-inputer :id="pS | idValue(picSrcArr)" v-model="file" :ref="pS | idKey(picSrcArr)" :img-src="/https:\/\/.+/.test(pS) ? pS : ''" size="small" accept="image/jpg,image/jpeg,image/gif,image/png" :max-size="maxSize" @onChange="fileChange" />
      </label>
    </div>
    <div v-else>
      <label v-for="item in tempInitNum" :key="item.idx" class="imgG">
        <img-inputer :id="item+''" v-model="file" :ref="item" :img-src="picSrc" size="small" accept="image/jpg,image/jpeg,image/gif,image/png" :max-size="maxSize" @onChange="fileChange" />
      </label>
      <el-button icon="el-icon-circle-plus-outline" circle @click="addComp" v-if="isAdd"></el-button>
    </div>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from 'vue-class-component'
import { Watch, Prop } from 'vue-property-decorator'
import OssMixin from 'mixin/OssMixin.ts'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css'
import * as A from '@/projects/menu/graphql/auth.gql'
import * as ossVar from '@/utils/ossVar.ts'
const OSS = require('aliOss')

@Component({})
export default class UpLoad extends mixins(OssMixin) {
  private name: string =  'up_load_pic'
  private $utils: any
  private $message: any
  private files: any
  private file: any
  private filesArr!: any[]
  private editArr!: any[]
  private delArr!: any[]
  private tempInitNum: number =  1
  private maxSize: number = 1024 * 3
  private urls!: any[]
  private url!: string
  private defaultFlag: string = 'img-'
  // ?是否可增加
  @Prop({ default: true }) private isAdd!: boolean
  // ?默认上传照片数
  @Prop({ default: 1 }) private uploadNum!: number
  // ?最大增加上传数
  @Prop({ default: 3 }) private maxNum!: number
  // ?默认最高权限
  @Prop({ default: ossVar.defaultPath }) private bucketUrl!: string
  // ?超管获取oss权限 boss权限必须存在子级目录才能使用
  @Prop({ default: false }) private boss!: boolean
  // ?回显url
  @Prop({ default: null }) private picSrc?: string | null
  // ?多张图片回显
  @Prop({ default: null }) private picSrcArr?: string[] | null
  // ?是否从sts获取权限
  @Prop({ default: true }) private bySTS!: boolean

  public data() {
    return {
      file: '',
      files: {},
      filesArr: [],
      client: {},
      editArr: [],
      delArr: [],
      tempInitNum: 1,
      maxSize: 1024 * 3,
      urls: [],
      url: '',
      defaultFlag: 'img-'
    }
  }
  public created() {
    // console.log('this.client', this.client)
    // console.log('boss', this.boss)
    this.tempInitNum = this.$utils.deepCopy(this.uploadNum, [])
    this.picSrcArr !== null ? this.editArr = this.$utils.deepCopy(this.picSrcArr, []) : this.editArr = this.editArr
  }
  public mounted() {
    // 初始化阿里云oss权限
    this.bySTS ? this.fetchAuth() : this.fetchAuthByKey()
  }
  // todo filter如何在ts中应用
  // filters: {
  //   idKey: function (e, arr) {
  //     return arr.indexOf(e) + 1
  //   },
  //   idValue: function (e, arr) {
  //     return arr.indexOf(e) + ''
  //   }
  // }
    /**
     * 文件选择,新增时文件上传
     * @param {Object} file 文件对象
     */
    private fileChange(file: any) {
      // console.log(this.$refs)
      for (const k in this.$refs) {
        if (this.$refs.hasOwnProperty(k)) {
          const element: any = this.$refs[k]
          const randomName = this.$utils.randomString() + '_' + new Date().getTime() + '.' + file.name.split('.').pop()
          this.files.randomName = randomName
          this.files.file = element[0].file
          if (element[0].file !== null) {
            this.filesArr[parseInt(k, undefined) - 1] = { ...this.files }
            if (this.picSrcArr !== null) {
              this.delArr[parseInt(k, undefined) - 1] = this.editArr[parseInt(k, undefined) - 1]
              this.editArr[parseInt(k, undefined) - 1] = null
            }
          }
        }
      }
      this.$emit('hasPic', true)
    }
    /**
     * 注册后上传
     */
    private async upLoadFile() {
      let flag
      const _this = this
      NProgress.start() // 进度条开始
      this.filesArr = this.filesArr.filter((params) => {
        return params !== null
      })
      for (const k in this.filesArr) {
        if (this.filesArr.hasOwnProperty(k)) {
          const files = this.filesArr[k]
          if (files.randomName !== undefined && files.file !== undefined) {
            const results = await this.client.multipartUpload(`${/.+\/$/.test(this.bucketUrl) ? this.bucketUrl : this.bucketUrl + '/'}` + files.randomName, files.file, {
              // *progress(percentage: any, cpt: any) {
                // 上传进度
                // _this.percentage = percentage
                // console.log('percentage-->', percentage)
              // }
            })
            // 上传完成
            this.url = ossVar.uploadUrl + results.name
            this.urls.push(this.url)
          }
        }
      }
      if (this.picSrcArr !== null) {
        this.editArr = this.editArr.filter((params) => {
          return /https:\/\/.+/.test(params)
        })
        this.delArr = this.delArr.filter((params) => {
          return /https:\/\/.+/.test(params)
        })
      }
      this.editArr.length > 0
        ? this.urls = this.urls.concat(this.editArr)
        : this.urls = this.urls
      this.$emit('urls', this.urls)
      this.urls.length > 0 ? flag = true : flag = false
      NProgress.done() // 进度条结束
      return flag
    }
    /**
     * 删除更新后垃圾文件
     * @param {Array} arrFileUrl 公司db存的url地址值
     */
    private delFile(arrFileUrl: string[]) {
      const pattern = ossVar.uploadUrl
      const reg = new RegExp(pattern + '(.+)')
      if (arrFileUrl.length > 0 && arrFileUrl[0].length) {
        arrFileUrl.forEach(async (fileUrl: any) => {
          await this.client.delete(fileUrl.match(reg)[1])
        })
      } else {
        return false
      }
    }
    /**
     * 增加可上传的照片数量
     */
    private addComp() {
      if (this.tempInitNum > this.maxNum - 1) {
        this.$message({
          message: `上传的图片最大限制为${this.maxNum}张`,
          type: 'warning'
        })
      } else {
        this.tempInitNum++
      }
    }
}
</script>

<style lang="scss" scoped>
.imgG {
  display: inline-block;
  margin-right: 8px;
}
</style>
