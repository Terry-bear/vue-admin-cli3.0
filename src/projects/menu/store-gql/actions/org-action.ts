import * as OGql from '@/projects/menu/graphql/org.gql'
import { NewOrgByCoMe, LesseeInput, CommissionerInput, TCom, ACom, ALes } from '@/projects/menu/store-gql/types.ts'
import { apolloProvider } from '@/projects/apollo.ts'
import {mutateApollo, queryApollo} from '../G_apollo'

// todo Org接口信息
export interface ShowObj {
  orgName: string
  regAddress: string
  industry: string
  tempPersonScale?: string | object
  orgType?: string
  legalPerson?: string
  licensePicUrl: string
  contactPerson?: string
  contactPhone?: string
  orgEmail?: string
  orgUrl?: string
  orgCode: string
  operatorName?: string
  orgStatus?: number
  regAddressCode?: string
  operatorId?: string
  postalLonLat: string
  personScale: string
}

// todo 审核接口信息
export interface CheckObj {
  orgName?: string | null,
  regAddress?: string | null,
  industry?: string | null,
  personScale?: string | null,
  orgType?: string | null,
  legalPerson?: string | null,
  contactPerson?: string | null,
  contactPhone?: string | null,
  orgEmail?: string | null,
  orgUrl?: string | null,
  orgCode?: string | null,
  licensePicUrl: string | null
}
// 查询企业信息
export const orgByMe = function({ commit, state, dispatch }: any) {
  return queryApollo('org', OGql.orgByMe, {
    token: state.token,
    orgNo: state.tokenObj.def
  })
}

// 新增企业
export const newOrgByCoMe = function({ commit, state, dispatch }: any, {orgEditByCoBo, loginUrl, checkCode}: NewOrgByCoMe) {
  return mutateApollo('org', OGql.newOrgByCoMe, {
    orgEditByCoBo,
    loginUrl,
    checkCode
  })
}

// 新增租户
export const newLesseeByCoBo = function({ commit, state, dispatch }: any, lesseeInput: LesseeInput) {
  return mutateApollo('org', OGql.newLesseeByCoBo, {
    token: state.token,
    lesseeInput
  })
}

// 编辑和设置租户
export const editLesseeByCoBo = function({ commit, state, dispatch }: any, lesseeInput: LesseeInput) {
  return mutateApollo('org', OGql.editLesseeByCoBo, {
    token: state.token,
    lesseeInput
  })
}

// 新增专员
export const newCommissionerCoBo = function({ commit, state, dispatch }: any, commissionerInput: CommissionerInput) {
  return mutateApollo('org', OGql.newCommissionerCoBo, {
    token: state.token,
    commissionerInput
  })
}

// 专员信息修改
export const editCommissionerByCoBo = function({ commit, state, dispatch }: any, commissionerInput: CommissionerInput) {
  return mutateApollo('org', OGql.editCommissionerByCoBo, {
    token: state.token,
    commissionerInput
  })
}

// 专员转移
export const transferCommissionerByCoBo = function({ commit, state, dispatch }: any, {oldCommId, newCommId}: TCom) {
  return mutateApollo('org', OGql.transferCommissionerByCoBo, {
    token: state.token,
    oldCommId,
    newCommId
  })
}

// 专员启用 停用
export const actCommissionerByCoBo = function({ commit, state, dispatch }: any, {commId, status}: ACom) {
  return mutateApollo('org', OGql.actCommissionerByCoBo, {
    token: state.token,
    commId,
    status
  })
}

// 租户启用和停用
export const actLesseeByCoBo = function({ commit, state, dispatch }: any, {lesseeNo, status}: ALes) {
  return mutateApollo('org', OGql.actLesseeByCoBo, {
    token: state.token,
    lesseeNo,
    status
  })
}
