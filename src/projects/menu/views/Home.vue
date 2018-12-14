<template>
  <div class="home">
    <h1>测试接口的调用</h1>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src
import * as g from '@/projects/menu/graphql/org.gql'
import { DollarApollo } from 'apollo-link-http'
import { Mutation, State, Getter, Action } from 'vuex-class'

@Component({
})
export default class Home extends Vue {
  @State('common') public stateCommon: any
  @Getter('syncMenuData') public getMenuData: any
  @Getter('syncCommonData') public getCommonData: any
  @Mutation('setMainContentUrl') public setMainContentUrl: any
  @Mutation('setToken') public setToken: any
  private $store: any
  private mounted() {
    // this.setToken('haha')
    // this.getMenuData
    // this.getCommonData
    // console.log('this', this.$store)
    // console.log('stateCommon', this.stateCommon)
    // console.log('setMainContentUrl', this.setMainContentUrl)
    // this.setMainContentUrl('hehe')
    // console.log('setToken', this.setToken)
    // this.getOrg()
  }
  private async getOrg() {
    try {
        const { data } = await (this as any).$apolloProvider.clients.org.query({
          query: g.orgByCoBo,
          variables: {
            token: 'eyJhbGciOiJSUzUxMiJ9.eyJzMSI6ImJvIiwiczIiOiJibyIsImRlZiI6ImMxIiwibGVzIjoiYzEiLCJjMSI6ImJvIiwic3ViIjoiMDU4YmNhZDg2NDg4MTFlODlhNzMwMjQyMGFmZjAyZmUiLCJpYXQiOjE1Mzk1ODM3MjYsImV4cCI6MTU0MDE4ODUyNn0.cO_NEmTP622upy3bOG5x5aghEXaF3GLN5x9yZKd1wCt80R-R7X_VBEjO72KuuM0iW3n6PwVOMBJt-d0Y-Mxv-FqIz6ysC2pBeWx89lQ96_fh_cN5m6SjxIPpQefaH00E32Bhox3bRlJYOWDbelCot5EKDDROE3vanHI3nnEFthc',
            pageNo: 1,
            pageSize: 10
          }
        })
        console.log('data', data.orgByCoBo)
      } catch (err) {
        console.error(err)
      }
  }
}
</script>
