declare module '*.vue' {
  import Vue from 'vue'
  export default Vue
}
// 强类型声明
declare module 'vue/types/vue' {
  // 3. 声明为 Vue 补充的东西
  interface Vue {
      $apolloProvider: any,
      axios: {
        get: any
      }
    }
  }

// declare module 'vue'
declare class AMap {}
declare module 'apollo-link-http'
declare module 'unfetch'
declare module 'vue-img-inputer'
declare module 'vue-echarts'
declare module 'vue-amap'
declare module 'js-base64'
declare module 'nprogress'
declare module 'qrcode'
declare module 'sockjs-client'
declare module 'clipboard'
declare module '*.gql'
declare module '*.png'
declare module 'elementUI'
