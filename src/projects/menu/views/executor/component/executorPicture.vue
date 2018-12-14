<template>
  <div>
    <div class="img_group">
      <div class="img_item" v-if="thisPicture !== ''" v-on:mouseover="mouseover" v-on:mouseout="mouseout">
        <img :src="thisPicture" width="100%" height="100%">
        <div class="hidden-update" v-show="!isHidden">
          <input type="file" name="pic" class="img_input" ref="imgFile" v-on:change="imgFile">
          <div class="content">
            <p style="font-size: 52px">+</p>
            <p style="font-size:12px;line-height:18px;">重新上传图片</p>
          </div>
        </div>
      </div>
      <div class="addImg" v-else>
        <input type="file" name="pic" class="img_input" ref="imgFile" v-on:change="imgFile">
        <div class="content">
          <p style="font-size: 52px">+</p>
          <p style="font-size:12px;line-height:18px;">上传照片</p>
        </div>
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
import * as authGql from '@/projects/menu/graphql/auth.gql'
import * as ossVar from '@/utils/ossVar.ts'
const OSS = require('aliOss')

interface ObjectType {
  [propName: string]: any
}
@Component({})
export default class ExecutorPicture extends mixins(ExtVue) {
  @Prop({default: ''}) private pictureUrl!: any
  @Prop({default: false}) private boss!: boolean
  @Prop({default: ossVar.PicPath }) private bucketUrl!: any
  private thisPicture!: string
  private imgFiles!: any[]
  private client!: any
  private percentage!: any
  private urls!: any
  private isHidden!: boolean
  private url!: string
  private pathName!: string

  public data() {
    return {
      thisPicture: this.pictureUrl,
      imgFiles: [],
      uuid: '',
      client: {},
      urls: [],
      url: '',
      percentage: 0,
      isHidden: true,
      pathName: this.$store.state.menu.tokenObj.sub
    }
  }
  public async mounted() {
    await this.fetchAuth()
  }
  public async fetchAuth() {
    try {
      const res = await this.$apollo.mutate({
        mutation: authGql.ossSts,
        variables: {
          token: this.$store.state.menu.token,
          path: this.boss ? [this.bucketUrl.match(/(.+)\/{1}/)[1]] : [this.bucketUrl + this.pathName]
        }
      })
      const { accessKeyId, accessKeySecret, stsToken } = res.data.ossSts
      this.client = new OSS({
        ...ossVar.ossSts,
        accessKeyId,
        accessKeySecret,
        stsToken
      })
    } catch (error) {
      this.$message({
        message: '请求错误',
        type: 'error'
      })
      throw new Error(`获取阿里云oss权限${error}`)
    }
  }
  public async upLoadFile() {
    const _this = this
    for (const k in this.imgFiles) {
      if (this.imgFiles.hasOwnProperty(k)) {
        const files = this.imgFiles[k]
        if (files.randomName !== undefined && files.file !== undefined) {
          const results = await this.client.multipartUpload(`${this.bucketUrl}${this.pathName}/executor/` + files.randomName, files.file, {
            *progress(percentage: any, cpt: any): any {
              _this.percentage = percentage
            }
          })
          this.url = ossVar.uploadUrl + results.name
          this.urls.push(this.url)
        }
      }
    }
    if (/https:\/\/.+/.test(this.thisPicture)) {
      this.urls = [this.thisPicture]
    }
  }
  public getTime() {
    function S4() { return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1) }
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
  }
  public imgFile() {
    const reads = new FileReader()
    const that = this
    const files: ObjectType = {}
    const file = this.$refs.imgFile.files[0]
    files.randomName = this.$utils.randomString() + '_' + new Date().getTime() + '.' + file.name.split('.').pop()
    files.file = file
    this.imgFiles[0] = files
    reads.readAsDataURL(file)
    reads.onload = async function(e: any) {
      that.thisPicture = e.target.result
    }
  }
  public mouseover() {
    this.isHidden = false
  }
  public mouseout() {
    this.isHidden = true
  }
}
</script>

<style lang="scss" scoped>
  .img_group {
    display: inline-block;
    vertical-align: top;
    width: 180px;
    margin-left: 80px;
    position: relative;
    > div {
      display: inline-block;
      vertical-align: top;
    }
  }
  .img_input {
    cursor: pointer;
    position: absolute;
    top: 0;
    left: 0;
    width: 100% !important;
    height: 100% !important;
    opacity: 0;
    outline: none;
  }
  .img_item {
    width: 96px;
    height: 102px;
    position: relative;
    margin-right: 8px;
    margin-bottom: 5px;
  }
  .hidden-update {
    width: 96px;
    height: 102px;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.45);
    z-index: 2;
  }
  .addImg {
    position: relative;
    width: 96px;
    height: 102px;
    margin-bottom: 5px;
    border: 1px dashed rgba(0, 0, 0, 0.15);
    background-color: rgba(251, 251, 251, 1);
    > input {
      cursor: pointer;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      outline: none;
    }
  }
  .content {
    width: 96px;
    height: 102px;
    text-align: center;
    > p {
      margin: 0;
      color: #d5d5d5;
    }
  }
  .img_delete {
    position: absolute;
    top: 0;
    left: 0;
    width: 150px;
    height: 102px;
    text-align: center;
    line-height: 102px;
    background-color: rgba(0, 0, 0, 0.45);
  }
</style>
