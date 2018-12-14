import * as MGql from '@/projects/menu/graphql/message.gql'
import { apolloProvider } from '@/projects/apollo.ts'
import {mutateApollo} from '../G_apollo'


// 一键已读 messageIds: string[]
export const editmessageByCoBo = function({ commit, state, dispatch }: any, messageIds: string[]) {
  return mutateApollo('message', MGql.editmessageByCoBo, {
    token: state.token,
    messageIds
  })
}
