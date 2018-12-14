<template>
  <div class="amap-page-container">
    <div v-loading="loading" :element-loading-text="loadingMsg" :style="`width:${width}; height:${height};`">
      <el-amap vid="amapDemo" :plugin="plugin" :center="center" :zoom="zoom" class="amap-demo" :events="events" :style="`width:${width}; height:${height};`">
        <el-amap-marker v-for="(marker, index) in markers" :key="index" :position="marker.position" :events="marker.events" :visible="marker.visible" :draggable="marker.draggable" :vid="index"></el-amap-marker>
      </el-amap>
    </div>
    <div class="toolbar" v-if="showInfo">
      <p>position: [{{ lng }}, {{ lat }}]</p>
      <p>address: {{ address }}</p>
      <p>adcode: {{ adcode }}</p>
    </div>
  </div>
</template>
<style>
</style>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'

interface Markers {
  position: any[],
  events: {
    click: () => {}
    dragend: (e: any) => {},
    visible: boolean,
    draggable: boolean,
    template: string
  }
}
@Component({})
export default class MapPostion extends Vue {
  private name: string = 'mapComp'
  private markers!: Markers[]
  private loading: boolean = true
  private loadingMsg: string =  '自动定位中~'
  private zoom: number =  14
  private center!: number[]
  private fullName!: string
  private address!: string
  private adcode!: string
  private lng!: number
  private lat!: number
  private loaded!: boolean
  private events!: any
  @Prop({ default: '600px' }) private width!: string
  @Prop({ default: '400px' }) private height!: string
  // ? 查看信息, 默认可看
  @Prop({ default: true }) private showInfo!: boolean
   // ? 是否自动定位,否则必须传入定位初始值
  @Prop({ default: true }) private isLocation!: boolean
  // ? isLocation为false时传入的必须值
  @Prop({ default: () => {
        return [106.630015, 26.64708]
        }
      }) private defPosition: any
  public mounted() {
    this.isStartLocation(this.isLocation)
  }
  private data() {
    const self = this
    return {
      loading: this.loading,
      loadingMsg: this.loadingMsg,
      zoom: this.zoom,
      center: self.defPosition,
      fullName: null,
      address: '',
      adcode: '',
      events: {
        // click 定位
        click(e: any) {
          self.loading = true
          const { lng, lat } = e.lnglat
          self.lng = lng
          self.lat = lat
          // 这里通过高德 SDK 完成。
          const geocoder = new (AMap as any).Geocoder({
            radius: 1000,
            extensions: 'all'
          })
          geocoder.getAddress([lng, lat], function(status: any, result: any) {
            // console.log(lng, lat, result)
            if (status === 'complete' && result.info === 'OK') {
              if (result && result.regeocode) {
                self.address = result.regeocode.formattedAddress
                self.adcode = result.regeocode.addressComponent.adcode
                self.fullName = `${result.regeocode.addressComponent.province}/${result.regeocode.addressComponent.city}/${result.regeocode.addressComponent.district}/${result.regeocode.addressComponent.street}/`
                self.loading = false
                self.$nextTick()
                self.markers[0].position = [lng, lat]
              }
            }
          })
        }
      },
      lng: 0,
      lat: 0,
      loaded: false,
      plugin: [{
        enableHighAccuracy: true, // 是否使用高精度定位，默认:true
        timeout: 100,          // 超过10秒后停止定位，默认：无穷大
        maximumAge: 0,           // 定位结果缓存0毫秒，默认：0
        convert: true,           // 自动偏移坐标，偏移后的坐标为高德坐标，默认：true
        showButton: true,        // 显示定位按钮，默认：true
        buttonPosition: 'RB',    // 定位按钮停靠位置，默认：'LB'，左下角
        showMarker: false,        // 定位成功后在定位到的位置显示点标记，默认：true
        showCircle: true,        // 定位成功后用圆圈表示定位精度范围，默认：true
        panToLocation: true,     // 定位成功后将定位到的位置作为地图中心点，默认：true
        zoomToAccuracy: false, // 定位成功后调整地图视野范围使定位位置及精度范围视野内可见，默认：f
        extensions: 'all',
        pName: 'Geolocation',
        events: {
          init(o: any) {
            // console.log(self.isLocation)
            // o 是高德地图定位插件实例
            o.getCurrentPosition((status: any, result: any) => {
              let timer = 0
              if (self.isLocation) {
                // console.log(result)
                const intVal = setInterval(() => {
                  timer++
                  if (timer === 8) {
                    clearInterval(intVal)
                    self.loadingMsg = '获取定位失败请手动选点'
                    setTimeout(() => {
                      self.loading = false
                    }, 2000)
                  }
                }, 1000)
                if (result && result.position) {
                  clearInterval(intVal)
                  // 自动定位的信息
                  self.lng = result.position.lng
                  self.lat = result.position.lat
                  self.address = result.formattedAddress
                  self.adcode = result.addressComponent.adcode
                  self.fullName = `${result.addressComponent.province}/${result.addressComponent.city}/${result.addressComponent.district}/${result.addressComponent.street}/`
                  self.center = [self.lng, self.lat]
                  self.loaded = true
                  self.loading = false
                  self.$nextTick()
                  self.markers[0].position = [self.lng, self.lat]
                }
              } else {
                // console.log('没有启动定位')
                self.lng = self.defPosition[0]
                self.lat = self.defPosition[1]
                self.center = [self.lng, self.lat]
                self.loaded = true
                self.loading = false
                self.$nextTick()
              }
            })
          }
        }
      },
      {
        pName: 'ToolBar',
        direction: false,
        locate: false,
        events: {
          init(instance: any) {
            // console.log(instance)
          }
        }
      }],
      markers: [
        {
          position: [],
          events: {
            click: () => {
              // alert('click marker')
              console.log('click marker')
            },
            dragend: (e: any) => {
              console.log('---event---: dragend')
              this.markers[0].position = [e.lnglat.lng, e.lnglat.lat]
            }
          },
          visible: true,
          draggable: false,
          template: '<span>1</span>'
        }
      ]
    }
  }
  // watch: {
  //   lng: function (e) {
  //     // console.log(this.markers[0].position)
  //     // this.changePosition(e, this.lat)
  //   },
  //   adcode: function (e) {
  //     if (e !== null && e !== '') {
  //       const codeLen = e.length
  //       let zeroAdd = 12 - codeLen
  //       let zeroNum = ''
  //       for (let i = 0; i < zeroAdd; i++) {
  //         zeroNum += '0'
  //       }
  //       e += zeroNum
  //     }
  //     this.adcode = e
  //     this.$emit('adr', this.address)
  //     this.$emit('adrCode', this.adcode)
  //     this.$emit('adrPosition', JSON.stringify([this.lng, this.lat]))
  //     this.$emit('adrMsg', {
  //       address: this.address,
  //       adcode: this.adcode,
  //       adrPosition: JSON.stringify([this.lng, this.lat])
  //     })
  //   }
  // }
    private changePosition(lng: any, lat: any) {
      let position = this.markers[0].position
      position = [lng, lat]
      // console.log(position)
    }
    /**
     * @param {Boolean} isLocation 是否启动定位的判断
     */
    private isStartLocation(isLocation: boolean) {
      if (!isLocation) {
        this.lng = this.defPosition[0]
        this.lat = this.defPosition[1]
        this.markers[0].position = this.defPosition
        this.loading = false
        this.events.click({ lnglat: { lng: this.lng, lat: this.lat } })
      } else {
        console.log('启动了定位')
        this.markers[0].position = this.defPosition
      }
    }
}
</script>
