<template>
  <div class="areaChoice">
    <div class="input">
      <el-input placeholder="请选择地区" @focus="showDialog" v-model="name"></el-input>
    </div>
    <span class="delete" v-if="dialog" @click="handleDia">X</span>
    <div class="box area-style-m" v-if="dialog">
      <el-tabs type="border-card" @tab-click="handleTabs" :value="vName">
        <el-tab-pane label="省份" name="省份">
          <div class="default-style">
            <span :class='proA.length && proA[0].code === item.code ? "item active" : "item"' v-for="(item, index) in defaultProvince" :key="item.code" v-on:click.stop="handleArea('proA', 'provice', 'city', item, index)">{{item.name}}</span>
          </div>
          <div id="pro">
            <span :class='proA.length && proA[0].code === item.code ? "item active" : "item"' v-for="(item, index) in provice" :key="item.code" v-on:click.stop="handleArea('proA', 'provice', 'city', item, index)">{{item.name}}</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="地级市" name="地级市">
          <div id="city">
            <span :class='cityA.length && cityA[0].code === item.code ? "item active" : "item"' v-for="(item, index) in city" :key="item.code" v-on:click.stop="handleArea('cityA', 'city', 'county', item, index)">{{item.name}}</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="区县" name="区县">
          <div id="county">
            <span :class='couA.length && couA[0].code === item.code ? "item active" : "item"' v-for="(item, index) in county" :key="item.code" v-on:click.stop="handleArea('couA', 'county', 'town', item, index)">{{item.name}}</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="乡镇" name="乡镇">
          <div id="town">
            <span :class='townA.length && townA[0].code === item.code ? "item active" : "item"' v-for="(item, index) in town" :key="item.code" v-on:click.stop="handleArea('townA', 'town', 'village', item, index)">{{item.name}}</span>
          </div>
        </el-tab-pane>
        <el-tab-pane label="村" name="村">
          <div id="vill">
            <span :class='villA.length && villA[0].code === item.code ? "item active" : "item"' v-for="(item, index) in village" :key="item.code" @click="handleCun(item, index)">{{item.name}}</span>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
import { mixins } from 'vue-class-component'
import TableMixin from 'mixin/TableMixin'
import ExtVue from 'mixin/ExtVue'
import ValidMixin from 'mixin/ValidMixin'

import * as areaGql from '@/projects/menu/graphql/area.gql'
interface IndexSignature {
  [key: string]: any
}
@Component({})
export default class ExecutorArea extends mixins(ExtVue) implements IndexSignature {
  [key: string]: any
  @Prop() private index!: any
  @Prop() private areaName!: string
  @Prop() private value!: any

  private provice!: any
  private dialog!: boolean
  private vName!: string
  private name!: string
  private cityA!: any[]
  private county!: any[]
  private people!: string
  private couA!: any[]
  private town!: any[]
  private village!: any[]
  private villA!: any[]
  private townA!: any[]
  public data() {
    return {
      name: this.areaName,
      dialog: false,
      provice: [],
      city: [],
      county: [],
      town: [],
      village: [],
      proA: [],
      cityA: [],
      couA: [],
      townA: [],
      villA: [],
      vName: '省份',
      defaultProvince: [
        {
          code: '520000000000',
          name: '贵州省',
          fullName: '贵州省'
        }
      ]
    }
  }
  public async created() {
    this.provice = await this.fetchAreaInfo()
  }
  public async fetchAreaInfo(areaCode = '') {
    try {
      const { data } = await this.$apollo.provider.clients.area.query({
        query: areaGql.area,
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
      return []
    }
  }
  public showDialog() {
    this.$emit('closeAll', false)
    this.dialog = true
  }
  public handleDia() {
    this.dialog = false
  }
  public handleTabs(type: any, e: any) {
    this.vName = type._props.label
  }
  public async handleArea(type: string, when: any, next: any, obj: any, index: any) {
    switch (when) {
      case 'provice':
        this.vName = '地级市'
        break
      case 'city':
        this.vName = '区县'
        break
      case 'county':
        this.vName = '乡镇'
        break
      case 'town':
        this.vName = '村'
        break
    }
    if (this[type].length === 1) {
      this[type].length = 0
    }
    this[type].push({ name: obj.name, code: obj.code })
    this[next] = await this.fetchAreaInfo(obj.code)
    switch (next) {
      case 'city':
        this.cityA = []
        this.county = []
        this.people = ''
        this.couA = []
        this.town = []
        this.townA = []
        this.village = []
        this.villA = []
        break
      case 'county':
        this.couA = []
        this.town = []
        this.people = ''
        this.townA = []
        this.village = []
        this.villA = []
        break
      case 'town':
        this.townA = []
        this.village = []
        this.villA = []
        this.people = ''
        break
    }
    this.name = obj.fullName
    this.$emit('onChange', { areaCode: '', areaName: '' }, this.index)
  }
  public handleCun(obj: any, index: any) {
    this.villA.push({ name: obj.name, code: obj.code })
    this.name = obj.fullName
    this.dialog = false
    this.$emit('onChange', { areaCode: obj.code, areaName: obj.fullName }, this.index)
  }
}
</script>

<style lang="scss" scoped>
.areaChoice {
  position: relative;
  width: 100%;
  height: 100%;
  > div,
  > span {
    display: inline-block;
    vertical-align: top;
  }
  .input {
    height: 100%;
    width: calc(100% - 130px);
  }
  .select {
    width: 100px;
  }
}
.box {
  position: absolute;
  top: 40px;
  left: 0;
  z-index: 998;
  width: 580px;
}
.item {
  display: inline-block;
  vertical-align: top;
  width: calc(100% / 5);
  height: 35px;
  line-height: 35px;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 0 !important;
  white-space: nowrap;
  cursor: pointer;
  &:hover {
    color: #1890ff;
  }
}
.active {
  background-color: #1890ff;
  color: #fff;
  &:hover {
    color: #fff;
  }
}
#pro,
#city,
#vill,
#town,
#county {
  width: 100%;
  min-height: 40px;
  text-align: left;
}
.delete {
  position: absolute;
  top: 40px;
  width: 30px;
  right: -100px;
  color: rgba(0, 0, 0, 0.25);
  z-index: 999;
  cursor: pointer;
}
.default-style {
  border-bottom: 2px solid #1890ff;
}
</style>
<style lang="scss">
.area-style-m .el-tabs__header {
  padding: 0 !important;
}
</style>
