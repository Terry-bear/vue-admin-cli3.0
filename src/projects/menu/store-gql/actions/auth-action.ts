import * as AGql from '@/projects/menu/graphql/auth.gql'
import { UserNameInput, LesseeInput } from '@/projects/menu/store-gql/types.ts'
import { apolloProvider } from '@/projects/apollo.ts'
import {mutateApollo} from '../G_apollo'

// todo 租户账号密码登录
// todo $userName: String!, $password: String!, $challenge: String!, $validate: String!,
// todo $seccode: String!, $serverNos: [String], $companyNos: [String], $lesseeId: String

export const newTokenByUserName = function({ commit, state, dispatch }: any, userNameInput: UserNameInput) {
  return mutateApollo('auth', AGql.newTokenByUserName, {
    ...userNameInput
  })
}
// todo 租户手机登录
export const newTokenByMobileNo = function({ commit, state, dispatch }: any, lesseeInput: LesseeInput) {
  return mutateApollo('auth', AGql.newTokenByMobileNo, {
    ...lesseeInput
  })
}
