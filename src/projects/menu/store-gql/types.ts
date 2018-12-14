export interface UserNameInput {
  userName: string
  password: string
  challenge: string
  validate: string
  seccode: string
  serverNos?: string[]
  companyNos?: string[]
  lesseeId?: string
}

export interface LesseeInput {
  // 租户编号
  lesseeId?: string
  // 系统名称
  systemName?: string
  // 所属主体
  principalPart?: string
  // 类型
  lesseeType?: string
  // 负责人
  principalPerson?: string
  // 联系电话
  principalMobile?: string
  // 登陆地址
  loginUrl?: string
  // 系统标题
  lesseeTitle?: string
  // 系统logo url
  lesseeLogoUrl?: string
  // 租户状态：-1停用/1启用
  lesseeStatus?: number
  // 系统描述
  lesseeFeedback?: string
}

export interface CommissionerInput {
  // 专员唯一标识
  commId?: string
  // 租户编号
  lesseeId?: string
  // 用户名
  userName?: string
  // 手机号
  mobile?: string
  // 姓名
  name?: string
  // 专员状态:-1停用/1启用
  commStatus?: number
  // 专员密码
  passWord?: string
}

export interface NewOrgByCoMe {
  orgEditByCoBo: any
  loginUrl: string
  checkCode: string
}

export interface TCom {
  oldCommId: string
  newCommId: string
}

export interface ACom {
  commId: string
  status: boolean
}

export interface ALes {
  lesseeNo: string
  status: boolean
}
