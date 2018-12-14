import { apolloProvider } from '@/projects/apollo.ts'

/**
 *
 * @param {string} prot 接口
 * @param {glq} body 请求gql的body
 * @param {object} variables 请求参数
 */
export const mutateApollo = async function(prot: string, body: any, variables: any) {
  try {
    if (prot === 'auth') {
      const res = await apolloProvider.defaultClient.mutate({
        mutation: body,
        variables
      })
      return res
    } else {
      const res = await apolloProvider.clients[prot].mutate({
        mutation: body,
        variables
      })
      return res
    }
  } catch (error) {
    return JSON.parse(JSON.stringify(error))
  }
}

/**
 *
 * @param {string} prot 接口
 * @param {glq} body 请求gql的body
 * @param {object} variables 请求参数
 */
export const queryApollo = async function(prot: string, body: any, variables: any) {
  try {
    if (prot === 'auth') {
      const res = await apolloProvider.defaultClient.query({
        query: body,
        variables,
        fetchPolicy: 'network-only'
      })
      return res
    } else {
      const res = await apolloProvider.clients[prot].query({
        query: body,
        variables,
        fetchPolicy: 'network-only'
      })
      return res
    }
  } catch (error) {
    return JSON.parse(JSON.stringify(error))
  }
}
