<template>
  <div>
    <div v-for="(item, index) in areaLength" :key="index" style="display: block">
      <el-select v-model="areaDataArr[index].provinceCode" placeholder="省份" value-key="code" @change="tempAreaSel(index, 'provinceCode', 'cityOpt')">
        <el-option v-for="item in provinceOpt" :key="item.code" :label="item.name" :value="item.code">
        </el-option>
      </el-select>
      <el-select v-model="areaDataArr[index].cityCode" placeholder="城市" @change="tempAreaSel(index, 'cityCode', 'countryOpt')">
        <el-option v-for="item in areaDataArr[index].cityOpt" :key="item.code" :label="item.name" :value="item.code">
        </el-option>
      </el-select>
      <el-select v-model="areaDataArr[index].countryCode" placeholder="区县" @change="tempAreaSel(index, 'countryCode', 'streetOpt')">
        <el-option v-for="item in areaDataArr[index].countryOpt" :key="item.code" :label="item.name" :value="item.code">
        </el-option>
      </el-select>
      <el-select v-model="areaDataArr[index].streetCode" placeholder="街道" @change="tempAreaSel(index, 'streetCode', 'villageOpt')">
        <el-option v-for="item in areaDataArr[index].streetOpt" :key="item.code" :label="item.name" :value="item.code">
        </el-option>
      </el-select>
      <el-select v-model="areaDataArr[index].villageCode" placeholder="村委会" @change="tempAreaSel(index, 'villageCode', '')">
        <el-option v-for="item in areaDataArr[index].villageOpt" :disabled="isDisabledFunction(item.code)" :key="item.code" :label="item.name" :value="item.code">
        </el-option>
      </el-select>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import * as g from '@/projects/menu/graphql/area.gql'
@Component({})
export default class CasAreaSelect extends Vue {
  @Prop({ default: 0 }) private deleteIndex!: number
  @Prop({ default: 3 }) private areaLength!: number
  private provinceOpt: any
  private areaDataArr!: any[]
  private villageArr!: any[]
  private $apollo: any
  private $message: any
  public data() {
    const areaArr = []
    for (let i = 0; i < this.areaLength; i++) {
      const areaInfo = {
        provinceCode: '',
        cityCode: '',
        cityOpt: '',
        countryCode: '',
        countryOpt: '',
        streetCode: '',
        streetOpt: '',
        villageCode: '',
        villageOpt: ''
      }
      areaArr.push(areaInfo)
    }
    return {
      provinceOpt: '',
      areaDataArr: areaArr,
      villageArr: []
    }
  }
  public async mounted() {
    this.provinceOpt = await this.fetchAreaInfo()
  }
    public async fetchAreaInfo(areaCode = '') {
      try {
        const { data } = await this.$apollo.provider.clients.area.query({
          query: g.area,
          variables: {
            areaCode
          },
          fetchPolicy: 'network-only'
        })
        return JSON.parse(JSON.stringify(data.area))
      } catch (error) {
        this.$message({
          message: '获取地址失败',
          type: 'error'
        })
      }
    }
    public async tempAreaSel(index: any, codeName: any, optionName: any) {
      let { cityCode, countryCode, streetCode, villageCode, cityOpt, countryOpt, streetOpt, villageOpt } = this.areaDataArr[index]
      const { provinceCode, provinceOpt } = this.areaDataArr[index]
      switch (codeName) {
        case 'provinceCode':
          cityCode = ''
          countryCode = ''
          streetCode = ''
          villageCode = ''
          cityOpt = ''
          countryOpt = ''
          streetOpt = ''
          villageOpt = ''
          break
        case 'cityCode':
          countryCode = ''
          streetCode = ''
          villageCode = ''
          countryOpt = ''
          streetOpt = ''
          villageOpt = ''
          break
        case 'countryCode':
          streetCode = ''
          villageCode = ''
          streetOpt = ''
          villageOpt = ''
          break
        case 'streetCode':
          villageCode = ''
          villageOpt = ''
          break
      }
      if (optionName !== '') {
        const code = this.areaDataArr[index][codeName]
        this.areaDataArr[index][optionName] = await this.fetchAreaInfo(code)
      }
      const areaChangeInfo = {
        index,
        provinceCode,
        cityCode,
        countryCode,
        streetCode,
        villageCode
      }
      this.villageArr[index] = villageCode
      this.$emit('areaChange', areaChangeInfo)
    }
    public async deldteData(index: number) {
      await this.areaDataArr.splice(index, 1)
    }
    public insertData() {
      const contactOptionInfo = {
        provinceCode: '',
        cityCode: '',
        cityOpt: '',
        countryCode: '',
        countryOpt: '',
        streetCode: '',
        streetOpt: '',
        villageCode: '',
        villageOpt: ''
      }
      this.areaDataArr.push(contactOptionInfo)
    }
    public isDisabledFunction(code: any) {
      for (const itr of this.villageArr) {
        if (code === itr) {
          return true
        }
      }
      return false
    }
}
</script>

<style scoped>
</style>
