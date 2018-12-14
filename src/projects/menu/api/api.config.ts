const DEV_PORT = '89' // dev ---> 端口号 89

// !当前分支的URL
// !提供dev版本的接口,请勿流量攻击
const CURR_PORT: string = '89'

// todo 自动部署apk上传的oss路径
export function currBranch() {
  switch (CURR_PORT) {
    case '89':
      return 'dev'
  }
}

export function GQL_URL(arg: string) {
  return `https://graphql.gshbzw.com:${CURR_PORT}/api/${arg}/graphql`
}

export const WEBSOCKET_NOTIFY_URL = `https://graphql.gshbzw.com:${CURR_PORT}/api/message/endpointUser`

export const WEBSOCKET_DATAV_URL = `https://graphql.gshbzw.com:${CURR_PORT}/api/message/endpointDatav`

export const AXIOS_URL = `https://graphql.gshbzw.com:${CURR_PORT}/`
