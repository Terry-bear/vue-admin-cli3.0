import Vue from 'vue'
import vueAmap, { lazyAMapApiLoaderInstance } from 'vue-amap'
// 高德地图vue
Vue.use(vueAmap)
// 初始化vueAmap
export const vueAmapPlugins = vueAmap.initAMapApiLoader({
  key: '***', // !指定账户的唯一key--> 需要自己注册高德地图获取key值
  plugin: [
    'Autocomplete',
    'PlaceSearch',
    'Scale',
    'OverView',
    'ToolBar',
    'MapType',
    'PolyEditor',
    'AMap.CircleEditor',
    // 定位
    'Geocoder',
    'Geolocation'
  ]
})

// 高德地图实例化
lazyAMapApiLoaderInstance.load().then(() => {
  // your code ...
  // this.map = new AMap.Map('amapContainer', {
  //   center: new AMap.LngLat(*********, *********)
  // })
})
