/**
 * 基于element-ui table合并列方法
 * @param {Array:Object} list
 */
interface OrgObj {
  companyName: string,
  companyNo: string
}
export default class Mergercol {
  constructor(public list: []) {
    this.list = list
  }
  /**
   * 组合可用companyMergeList
   * @param {String} args 可选的合并参数列(companyName, companyNo)
   */
  public packMergeList(args: string) {
    let beforeComNa: string
    let comNum: number = 1
    let packObj: any
    const packList: [] | any = []
    let overObj = false
    if (this.list.length < 2) { return this.list }
    this.list.forEach((obj: OrgObj) => {
      switch (args) {
        case 'companyName':
          if (beforeComNa !== obj.companyName) {
            if (overObj) {
              packObj = { name: beforeComNa, num: comNum }
              packList.push(packObj)
              comNum = 1
            }
            beforeComNa = obj.companyName
            overObj = true
          } else {
            comNum++
            packObj = { name: obj.companyName, num: comNum }
          }
          break
        case 'companyNo':
          if (beforeComNa !== obj.companyNo) {
            if (overObj) {
              packObj = { name: beforeComNa, num: comNum }
              packList.push(packObj)
              comNum = 1
            }
            beforeComNa = obj.companyNo
            overObj = true
          } else {
            comNum++
            packObj = { name: obj.companyNo, num: comNum }
          }
          break
        default:
          if (beforeComNa !== obj.companyName) {
            if (overObj) {
              packObj = { name: beforeComNa, num: comNum }
              packList.push(packObj)
              comNum = 1
            }
            beforeComNa = obj.companyName
            overObj = true
          } else {
            comNum++
            packObj = { name: obj.companyName, num: comNum }
          }
          break
      }
    })
    packList.push(packObj)
    // console.log('packList', packList)
    return packList
  }

  /**
   * 合并列方法,直接放入objectSpanMethod
   * @param {Array :Object} row objectSpanMethod填充的行数据
   * @param {Number} columnIndex objectSpanMethod提供的列
   * @param {Number} rowIndex objectSpanMethod提供的行
   * @param {Array :Array} docker docker里面存放array顺序不能改变,分别为companyName,companyNo
   */
  public objectSpanCol(row: OrgObj, columnIndex: number, rowIndex: number, ...docker: any) {
    const list: [] = docker[0]
    const listi: [] = docker[1]
    let roswIndex = 0
    let rosiIndex = 0
    // 合并企业名称
    if (list instanceof Array) {
      // columnIndex合并列位置
      if (columnIndex === 2) {
        for (const rosw of list) {
          if (row.companyName === (rosw as any).name) {
            if (rowIndex === roswIndex) {
              return {
                rowspan: (rosw as any).num,
                colspan: 1
              }
            } else {
              return {
                rowspan: 0,
                colspan: 0
              }
            }
          }
          roswIndex = roswIndex + (rosw as any).num
        }
      }
    } else {
      console.error('docker[0]传入的不是个合法数组!')
    }

    // 合并企业编号
    if (list instanceof Array) {
      if (columnIndex === 1) {
        for (const rosi of listi) {
          if (row.companyNo === (rosi as any).name) {
            if (rowIndex === rosiIndex) {
              return {
                rowspan: (rosi as any).num,
                colspan: 1
              }
            } else {
              return {
                rowspan: 0,
                colspan: 0
              }
            }
          }
          rosiIndex = rosiIndex + (rosi as any).num
        }
      }
    } else {
      console.error('docker[1]传入的不是个合法数组!')
    }
  }
}
