import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class ExtVue extends Vue {
  /**
   * todo 解决调用vue原型属性或者方法,在tslint中会报错的情况
   */
  public $apollo: any
  public $apolloProvider: any
  public $store: any
  public $router: any
  public $route: any
  public $utils: any
  public $message: any
  public $refs: any
  public $parent: any
  public $api: any
  public data() {
    return {
    }
  }
}
