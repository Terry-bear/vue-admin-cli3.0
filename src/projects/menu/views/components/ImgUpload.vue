<template>
  <div>
    <div class="img_group">
      <div class="img_item" v-for="img in imgs" :key="img.uuid" v-if="imgs.length > 0" v-on:mouseenter="mouseover(img.uuid)">
        <img :src="img.src" alt="" width="100%" height="100%">
        <div class="img_delete" v-if="uuid === img.uuid" v-on:mouseout="mouseout">
          <i class="el-icon-delete" style="cursor: pointer;color: #fff;font-size: 30px" @click="deleteImg(img.uuid)"></i>
        </div>
      </div>
      <div class="addImg" v-if="imgs.length < length">
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
import { mixins } from 'vue-class-component'
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import * as g from '@/projects/menu/graphql/auth.gql'
import * as ossVar from '@/utils/ossVar.ts'
import OssMixin from 'mixin/OssMixin'
const OSS = require('aliOss')

@Component({})
export default class ImgUpload extends mixins(OssMixin) {
  // ?可上传数量
  @Prop({ default: 9 }) public length!: number
  // ?传入数据
  @Prop() public imgDate: any
  // ?超管获取oss权限 boss权限必须存在子级目录才能使用
  @Prop({ default: false }) public boss!: boolean
  // ?默认最高权限
  @Prop({ default: ossVar.defaultPath }) public bucketUrl: any
  // ?多张图片回显
  @Prop() public picSrcArr!: string[]

  public $utils: any
  public $message: any
  public imgFiles: any[] = []
  public imgs: any = this.imgDate
  public uuid!: string
  public client!: any
  public urls!: string[]
  public url!: string
  public data() {
    return {
      imgFiles: this.imgFile,
      imgs: this.imgs,
      uuid: '',
      client: {},
      urls: [],
      url: ''
    }
  }
  public mounted() {
    // 初始化阿里云oss权限
    this.client = this.fetchAuth()
    if (this.picSrcArr !== null) {
      const copyPicSrcArr = this.$utils.deepCopy(this.picSrcArr.filter((params) => {
        return params !== null && params !== ''
      }))
      this.imgs = []
      for (const objUrl of copyPicSrcArr) {
        this.imgs.push({ src: objUrl, uuid: this.getTime() })
      }
    }
  }
    /**
     * @method function 获取阿里云oss权限
     *  !STS方式
     *
     */
    public async fetchAuth() {
      try {
        // 请求stsToken
        const res = await this.$apollo.mutate({
          mutation: g.ossSts,
          variables: {
            token: this.$store.state.menu.token,
            path: this.boss ? [this.bucketUrl.match(/(.+)\/{1}/)[1]] : [this.bucketUrl]
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
    /**
     * 注册后上传
     */
    public async upLoadFile() {
      let tempArrUrl = []
      const _this = this
      for (const k in this.imgFiles) {
        if (this.imgFiles.hasOwnProperty(k)) {
          const files = this.imgFiles[k]
          if (files.randomName !== undefined && files.file !== undefined) {
            const results = await this.client.multipartUpload(`${this.bucketUrl}/` + files.randomName, files.file, {
              *progress(percentage: any, cpt: any): IterableIterator<any> {
                // 上传进度
                // _this.percentage = percentage
                // console.log('percentage-->', percentage)
              }
            })
            // 上传完成
            this.url = ossVar.uploadUrl + results.name
            this.urls.push(this.url)
            // console.log(this.urls)
          }
        }
      }
      tempArrUrl = this.imgs.map((params: any) => {
        if (/https:\/\/.+/.test(params.src)) {
          return params.src
        }
      }).filter((params: any) => {
        return params !== undefined
      })
      tempArrUrl.length > 0
        ? this.urls = this.urls.concat(tempArrUrl)
        : this.urls = this.urls
      // this.$emit('urls', this.urls)
    }
    /**
     * 删除更新后垃圾文件
     * @param {Array} arrFileUrl 公司db存的url地址值
     */
    public delFile(arrFileUrl: string[]) {
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

    // add img
    public getTime() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
      }
      return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4())
    }
    public imgFile(obj: any) {
      const reads = new FileReader()
      const that = this
      const files: any = {}
      const file = (this as any).$refs.imgFile.files[0]
      files.randomName = this.$utils.randomString() + '_' + new Date().getTime() + '.' + file.name.split('.').pop()
      files.file = file
      this.imgFiles.push(files)
      // this.$emit('onChange', this.imgFiles)
      reads.readAsDataURL(file)
      reads.onload = async function(e: any) {
        that.imgs.push({ src: e.target.result, uuid: that.getTime() })
      }
    }
    public mouseover(id: any) {
      this.uuid = id
    }
    public mouseout() {
      this.uuid = ''
    }
    public deleteImg(id: any) {
      for (let i = 0; i < this.imgs.length; i++) {
        if (this.imgs[i].uuid === id) {
          this.imgs.splice(i, 1)
          this.imgFiles.splice(i, 1)
        }
      }
      // this.$emit('onChange', this.imgFiles)
    }
}
</script>

<style lang="scss" scoped>
.img_group {
  display: inline-block;
  vertical-align: top;
  width: 580px;
  margin-left: 80px;
  > div {
    display: inline-block;
    vertical-align: top;
    /*background-color: #2d8cf0;*/
  }
}
.img_item {
  width: 150px;
  height: 102px;
  position: relative;
  margin-right: 8px;
  margin-bottom: 5px;
}
.addImg {
  position: relative;
  width: 96px;
  height: 100px;
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
  width: 100%;
  height: 100%;
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
