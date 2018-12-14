import { Component, Vue, Watch, Prop, Emit } from 'vue-property-decorator'

const REGEX_CHINESE_CHAR = /[\u4e00-\u9fa5]+/gm

interface ListQuery {
  limit: number | string
  page: number | string
  username: any
  versionName: any,
  versionCode: any,
  orgName: any,
  offerName: any
  [key: string]: any,
  taskName: any,
  mobileNo: any
}
// todo 格式化过长的行数据
Vue.filter('fLongerStr', function(e: any, arg: any) {
  if (typeof e === 'string' && e.length > arg - 1) {
    return e.substring(0, arg) + '...'
  } else {
    return e
  }
})
// todo 格式化企业规模
Vue.filter('fPersonScale', function(arg: any) {
  if (typeof arg === 'string' && /.label./.test(arg)) {
    return JSON.parse(arg).label
  } else {
    return arg
  }
})
// todo 格式化日期---只保留到日
Vue.filter('formatDate', function(date: any) {
  if (typeof date === 'string' && date.length > 16) {
    return date.slice(0, 10)
  } else if (date === null || date === undefined || date === '') {
     return '-'
    } else { return date }
})
// todo 格式化五险一金福利的显示
Vue.filter('regInsHousingFund', function(e: any) {
  let arrToStr
  e === undefined ? (arrToStr = []) : (arrToStr = e.match(REGEX_CHINESE_CHAR))
  return arrToStr.toString()
})
// todo 格式化其他福利的显示
Vue.filter('regWelfare', function(e: any) {
  let arrToStr
  e === undefined ? (arrToStr = []) : (arrToStr = e.match(REGEX_CHINESE_CHAR))
  return arrToStr.toString()
})
@Component({
  components: {
    vertical: {
      template: `
      <font color="#BFBFBF">|</font>
      `
    }
  }
})
export default class TableMixin extends Vue {
  public loading: boolean = false
  public maxHeight!: any
  public adaptWidth!: any
  public getViewportSize!: any
  public pageTotalRows!: number
  public listQuery!: ListQuery
  public data() {
    return {
      // table加载属性
      loading: false
    }
  }
  public created() {
    // 配置动态高度
    this.maxHeight = this.getViewportSize().height * 0.7
    this.adaptWidth = `width:${this.getViewportSize().width - 24 * 4}px;`
    // console.log(this.getViewportSize().width)
  }
  /**
   * 分页逻辑
   * 自选每页显示条数
   * @param {*} val
   */
  public handleSizeChange(val: number) {
    let computePageSize
    this.isLoading(true)
    computePageSize = Math.ceil(this.pageTotalRows / val)
    if (val < this.pageTotalRows) {
      this.listQuery.limit = val
      if (this.listQuery.page > computePageSize) {
        this.listQuery.page = computePageSize
      }
    } else {
      this.listQuery.limit = val
    }
  }
  /**
   * 分页查询---查询第几页
   * @param {*} val
   */
  public handleCurrentChange(val: number) {
    this.isLoading(true)
    this.listQuery.page = val
  }
  /**
   * 是否显示加载框 --- 参数bool控制
   * @param {Boolean} bool
   */
  public isLoading(bool: boolean) {
    bool
      ? (this.loading = bool)
      : setTimeout(() => {
          this.loading = bool
        }, 250)
  }
}
