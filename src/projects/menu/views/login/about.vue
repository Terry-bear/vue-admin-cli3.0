<template>
  <div>
    <h3>关于</h3>
    <el-row :gutter="10">
      <div class="even-cube" v-for="itm in versionArr" :key="itm.index">
        <el-col :lg="7">
          <div class="grid-content bg-purple">
            <p v-html="itm.mission"></p>
            <p>版本号: {{itm.commit}}</p>
            <p>提交时间: {{itm.date}}</p>
          </div>
        </el-col>
      </div>
    </el-row>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import gql from 'graphql-tag'

@Component({})
export default class About extends Vue {
  private axios!: any
  private versionArr: Array<{}> = []
  private mission: string[] = []
  private data() {
    return {
      versionArr: [],
      mission: Object.keys((this as any).$apolloProvider.clients)
    }
  }
  private mounted() {
    console.log('axios', (this as any).axios)
    // port-version
    this.mission.forEach(async (mission: string) => {
      try {
        const { data } = await (this as any).$apolloProvider.clients[mission].query({
          query: gql`query  {
                        gitVersion{
                          commit
                          date
                        }
                      }`,
          fetchPolicy: 'network-only'
        })
        this.versionArr.push({
          mission: mission === 'defaultClient' ? 'auth' : mission,
          ...data.gitVersion
        })
      } catch (error) {
        this.versionArr.push({
          mission: mission === 'defaultClient' ? 'auth' : mission,
          commit: '',
          date: ''
        })
      }
    })
    // front-end-version
    const self = this
    this.axios.get('public/currentLog.txt').then((response: any) => {
      const dataArr = response.data.replace(/\r/g, '').split('\n')
      const useData = dataArr.slice(0, 4)
      if (useData[3].length > 0) {
        self.versionArr.push({
          mission: 'front-end',
          commit: useData[0].slice(7),
          date: useData[3].slice(7),
          merge: useData[1].slice(7)
        })
      } else {
        self.versionArr.push({
          mission: 'front-end',
          commit: useData[0].slice(7),
          date: useData[2].slice(7)
        })
      }
    }).catch((error: any) => {
      console.log(error)
    })
  }
}
</script>

<style scoped>
.even-cube .el-col.el-col-24.el-col-lg-7 {
  margin: 5px;
  border: 1px solid gray;
  box-sizing: border-box;
}
</style>
