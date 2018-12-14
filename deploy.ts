const OSS = require('ali-oss')
const path = require('path')
const fs = require('fs')
const co = require('co')

/**
 * todo 这是一个调用阿里云oss存储的node实现版
 */
if (process.argv.length !== 4) {
  console.error('用法：node ./' + path.basename(process.argv[1]) + ' 项目名 OSS桶名')
}

const localDir = 'dist/' + process.argv[2] + '/'
const bucketName = process.argv[3]

if (!fs.existsSync(localDir)) {
  console.error('项目文件夹：' + localDir + '不存在')
}

const client = new OSS({
  region: 'oss-cn-shenzhen',
  accessKeyId: '***',
  accessKeySecret: '***',
  bucket: bucketName
})

/**
 * @method 组装删除可用的arr
 * @list {Array} list 传入的list
 */
function getDeleteFile(list) {
  const DataArr = []
  const DirArr = []
  list.forEach(leve1 => {
    if (!/\/+$/.test(leve1.name)) { DataArr.push(leve1.name) } else { DirArr.push(leve1.name) }
  })
  return DataArr.concat(DirArr)
}

function getUploadFile(path) {
  let filesList = []
  const files = fs.readdirSync(path)
  files.forEach(function(itm, index) {
    const stat = fs.statSync(path + itm)
    if (stat.isDirectory()) {
      // 递归读取文件
      filesList = filesList.concat(getUploadFile(path + itm + '/'))
    } else {
      const localPath = path + itm
      // console.log('localPath:' + localPath)
      filesList.push(localPath)
    }
  })
  return filesList
}

client.list()
  .then(result => {
    if (result.objects === 'null' || result.objects === null || result.objects === 'undefined' || result.objects === undefined || result.objects === '') {
      console.log('OSS桶' + bucketName + '为空，无需清理!')
      return
    }
    return client.deleteMulti(getDeleteFile(result.objects), { quiet: true })
  })
  .then(result => {
    getUploadFile(localDir).forEach(localPath => {
      const ossPath = localPath.replace(localDir, '')
      // console.log('ossPath:' + ossPath)
      // console.log('localPath:' + localPath)
      client.put(ossPath, localPath).then(result => {
        // console.log('put result: %j' , result)
      }).catch(err => {
        console.error('上传文件：' + localPath + '时失败', err)
        return // 失败则，退出循环
      })
    })
  })
  .catch(err => {
    console.error('OSS桶：' + bucketName + '不存在或无权访问')
  })
