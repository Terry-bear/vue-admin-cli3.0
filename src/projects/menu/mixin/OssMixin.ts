import Vue from 'vue'
import Component from 'vue-class-component'
import * as ossVar from '@/utils/ossVar.ts'
import * as A from '@/projects/menu/graphql/auth.gql'
import * as O from '@/projects/menu/graphql/org.gql'
const OSS = require('aliOss')

@Component({})
export default class OssMixin extends Vue {
  public client: any
  public $apollo: any
  public $store: any
  public data() {
    return {
      client: {}
    }
  }
    /**
     * @method function 获取阿里云oss权限
     *  !直接初始化
     */
    public fetchAuthByKey() {
      this.client = new OSS({
        ...ossVar.ossSts,
        ...ossVar.tempAuthKey
      })
      // console.log(this.client)
    }
    public async fetchAuth() {
      try {
        // 请求stsToken
        const res = await this.$apollo.mutate({
          mutation: A.ossSts,
          variables: {
            token: this.$store.state.menu.token,
            path: ['org/license', 'tmp/license']
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
        // this.$message({
        //   message: '请求错误',
        //   type: 'error'
        // })
        throw new Error(`获取阿里云oss权限${error}`)
      }
    }
    public async copyFile(orginUrl: string | null, newUri: string, orgNo: string) {
      let fileName: string
      let newUrl: string
      let uploadUrl: string
      if (orginUrl === null) { return }
      if (/tmp\/license\//gi.test(orginUrl)) {
        await this.fetchAuth()
        uploadUrl = orginUrl
          .replace(/\["(.+)"\]/, '$1')
          .replace(/\/tmp\/license\//, newUri)
        newUrl = orginUrl
          .replace(/\["(.+)"\]/, '$1')
          .replace(/\/tmp\/license\//, newUri)
          .replace(/https:\/\/pd-api-dev\.oss-cn-shenzhen\.aliyuncs\.com\//, '')
        fileName = orginUrl
          .replace(/\["(.+)"\]/, '$1')
          .replace(/https:\/\/pd-api-dev\.oss-cn-shenzhen\.aliyuncs\.com\//, '')
        this.client.copy(newUrl, fileName).then((result: any) => {
          // console.log('result', result)
          const { data } = this.$apollo.provider.clients.org.mutate({
            mutation: O.editOrgByCoBo,
            variables: {
              token: this.$store.state.menu.token,
              companyNo: orgNo,
              orgEditByCoBo: {
                licensePicUrls: [uploadUrl]
              }
            }
          })
          console.log('success', data)
        })
      }
    }
}
