import { currBranch } from '@/projects/menu/api/api.config.ts'
interface OssToken {
  bucket: string
  region: string
}
interface Oss {
  accessKeyId: string
  accessKeySecret: string
}
/**
 * @param {Object} ossSts oss存储bucket和region
 */
export const ossSts: OssToken = {
  // 阿里云oss的bucket名字
  bucket: '***',
  region: 'oss-cn-shenzhen'
}

export const ossStsExcuApk: OssToken = {
  bucket: '***',
  region: 'oss-cn-shenzhen'
}

export const ossStsFile: OssToken = {
  bucket: '***',
  region: 'oss-cn-shenzhen'
}

export const tempAuthKey: Oss = {
  // 不用STS认证的私钥
  accessKeyId: '***',
  accessKeySecret: '***'
}
/**
 * @param {String} defaultPath 默认存储文件夹路径
 */
export const defaultPath = `org/license`

/**
 * @param {String} PicPath 默认存储文件夹路径
 */
export const PicPath = `auth/headpic/`
/**
 * @param {String} uploadUrl 上传的url
 */
export const uploadUrl = `https://${ossSts.bucket}.${ossSts.region}.aliyuncs.com/`
