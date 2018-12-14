<template>
  <div>
    <div class="avatar" style="margin:0 auto;height:90px;width:90px;">
      <label class="wrapper-upload-btn">
        <input type="file" accept="image/jpeg,image/x-png,image/gif" class="avatar-uploader" @change="beforeAvatarUpload" />
        <img :src="picUrlFmt" alt="" class="user-header">
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import * as g from '@/projects/menu/graphql/auth.gql'
import defaultUrl from '@/projects/menu/assets/img/users.png'
import * as ossVar from '@/utils/ossVar'
const OSS = require('aliOss')
@Component({})
export default class HeadPic extends Vue {
  @Prop() private picUrl!: string
  private $message!: any
  private $apollo!: any
  private $store!: any
  private client!: any
  private url!: string
  private user!: string
  private userName!: string
  private fullName!: string
  private idCard!: string
  private userId!: string
  private percentage!: any
  public data() {
    return {
      client: {},
      file: '',
      percentage: 0,
      url: '',
      defaultUrl,
      userId: this.$store.state.menu.tokenObj.sub
    }
  }
  public created() {
    // 初始化阿里云oss权限
    this.client = this.fetchAuth()
    // console.log('this.client', this.client)
  }
  private get picUrlFmt() {
    if (!this.url && !this.picUrl) {
        return defaultUrl
      } else if (this.url) {
        return this.url
      } else {
        return this.picUrl
      }
  }
    /**
     * @method function 获取阿里云oss权限
     *
     */
    public async fetchAuth() {
      try {
        // 请求stsToken
        const res = await this.$apollo.mutate({
          mutation: g.ossSts,
          variables: {
            token: this.$store.state.menu.token,
            path: [ossVar.PicPath + this.$store.state.menu.tokenObj.sub]
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

    // 随机生成文件名
    public randomString(len: number) {
      len = len || 32
      const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
      const maxPos = chars.length
      let pwd = ''
      for (let i = 0; i < len; i++) {
        pwd += chars.charAt(Math.floor(Math.random() * maxPos))
      }
      return pwd
    }
    /**
     * 上传至公司服务器
     */
    public async mutationData() {
      // console.log('token', this.$store.state.menu.token)
      try {
        const { userName, fullName, idCard, url } = this
        const firstVariables = {
          headpic: url
        }
        // console.log('this--children----->', this)
        const resData = await this.$apollo.mutate({
          mutation: g.editUserByMe,
          variables: {
            token: this.$store.state.menu.token,
            userEditByMe: firstVariables
          }
        })
        // console.log('resData', resData)
        this.$message({
          message: '头像上传成功',
          type: 'success'
        })
      } catch (error) {
        console.error('修改个人信息出错', error)
        this.$message({
          message: '修改个人信息失败,请稍后重试!~~~',
          type: 'warning'
        })
        throw new Error(`mutation--editUserByMe-->${error}`)
      }
    }
    /**
     * @method func 请求的单文件上传
     */
    public beforeAvatarUpload(e: any) {
      const files = e.target.files || e.dataTransfer.files
      const _that = this
      for (const fitr of files) {
        const isJPG = fitr.type === 'image/jpeg' || fitr.type === 'image/png' || fitr.type === 'image/gif'
        const isLt2M = fitr.size / 1024 / 1024 < 2
        if (!isJPG) {
          this.$message.error('上传头像图片只能是 JPG/jpeg/gif 格式!')
        }
        if (!isLt2M) {
          this.$message.error('上传头像图片大小不能超过 2MB!')
        }
        if (isJPG && isLt2M) {
          this.percentage = 0
          const resultUpload = ''
          // 随机命名
          const randomName = this.randomString(6) + '_' + new Date().getTime() + '.' + fitr.name.split('.').pop()
          console.log('randomName', randomName)
          // 上传
          this.client.multipartUpload(`auth/headpic/${this.userId}/` + randomName, fitr, {
            *progress(percentage: any, cpt: any): IterableIterator<any> {
              // 上传进度
              _that.percentage = percentage
              console.log('percentage-->', percentage)
            }
          }).then((results: any) => {
            // 上传完成
            this.url = ossVar.uploadUrl + results.name
            console.log(this.url)
            this.mutationData()
          }).catch((err: any) => {
            console.log('xxxx' + err)
          })
        }
      }
    }
}
</script>
<style lang="scss" scoped>
.avatar {
  input {
    position: absolute;
    left: -9999px;
  }
  .user-header {
    z-index: 10;
    height: 90px;
    width: 90px;
    position: relative;
    top: -2px;
    left: -1px;
    border: 0;
    border-radius: 50%;
  }
}
.wrapper-upload-btn {
  margin: 0 auto;
  height: 90px;
  width: 90px;
  background: rgba(119, 136, 190, 0.151);
  color: #333;
  border: 1px solid rgb(47, 150, 235);
  border-radius: 50%;
  box-sizing: border-box;
  font-size: 0;
  box-shadow: 1px 1px 5px rgba(42, 132, 235, 0.822),
    0 0 10px rgba(24, 105, 228, 0.7);
  display: block;
  cursor: pointer;
  & :hover {
    border: 1px solid rgb(47, 150, 235);
    border-radius: 50%;
    font-size: 0;
    box-shadow: 1px 1px 15px rgba(42, 132, 235, 0.3),
      1px 1px 10px rgba(24, 105, 228, 0.3);
    width: 95px;
    height: 95px;
    transition: 1s;
  }
}
</style>
