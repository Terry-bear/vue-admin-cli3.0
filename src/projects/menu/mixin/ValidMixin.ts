import Vue from 'vue'
import Component from 'vue-class-component'

const REGEX_NUM = /^\d+$/gm
const REGEX_CHINESE = /[\u4e00-\u9fa5]+/gm
const REGEX_ID_CARD = /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/
const REGEX_ = /d/

@Component
export default class ValidMixin extends Vue {
  public data() {
    // 验证数字
    const checkNum = (rule: any, value: any, callback: any) => {
      if (!REGEX_NUM.test(value)) {
        return callback(new Error('只能输入数字'))
      } else {
        callback()
      }
    }
    // 验证是否包含中文字符
    const checkChinese = (rule: any, value: any, callback: any) => {
      if (!REGEX_CHINESE.test(value)) {
        return callback(new Error('请包含中文字符'))
      } else {
        callback()
      }
    }
    // 验证身份证号
    const checkIdCard = (rule: any, value: any, callback: any) => {
      if (!REGEX_ID_CARD.test(value)) {
        return callback(new Error('请输入正确的身份证号'))
      } else {
        callback()
      }
    }

    return {

    }
  }
}
