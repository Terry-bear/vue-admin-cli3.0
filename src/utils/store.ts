import { validateNull } from './string'
/**
 * 存储localStorage
 */
export const setStore = (params: any) => {
  const { name, content, type, datetime } = params
  const obj = {
    dataType: typeof (content),
    content,
    type,
    datetime: new Date().getTime()
  }
  if (type) { window.sessionStorage.setItem(name, JSON.stringify(obj)) } else { window.localStorage.setItem(name, JSON.stringify(obj)) }
}
/**
 * 获取localStorage
 */
export const getStore = (params: any) => {
  const { name, type } = params
  let obj: string | null | any = {}
  let content
  obj = window.localStorage.getItem(name)
  if (validateNull(obj)) { obj = window.sessionStorage.getItem(name) }
  if (validateNull(obj)) { return }
  obj = JSON.parse(obj)
  if (obj.dataType === 'string') {
    content = obj.content
  } else if (obj.dataType === 'number') {
    content = Number(obj.content)
  } else if (obj.dataType === 'boolean') {
    // content = eval(obj.content)
    if (obj.content.toLowerCase() === 'true') {
      content = true
    } else {
      content = false
    }
  } else if (obj.dataType === 'object') {
    content = obj.content
  }
  return content
}
/**
 * 删除localStorage
 */
export const removeStore = (params: any) => {
  const { name } = params
  window.localStorage.removeItem(name)
  window.sessionStorage.removeItem(name)
}
