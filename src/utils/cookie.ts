// Cookie处理方法
export default {
  // 写入cookie
  writeCookie: (name: any, value: any, expiresIn: any) => {
    let expire: any = new Date(new Date().getTime() + +expiresIn)
    expire = '; expires=' + expire.toGMTString() // toUTCString,toGMTString
    document.cookie = name + '=' + escape(value) + expire + '; path=/'
  },

  // 读取cookie
  getCookie: (name: any) => {
    const arr: any = null
    const reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)')
    return arr === document.cookie.match(reg) ? unescape(arr[2]) : null
  },

  // 清除cookie
  removeCookie(name: any) {
    (this as any).default.writeCookie(name, '1', -1)
  }
}
