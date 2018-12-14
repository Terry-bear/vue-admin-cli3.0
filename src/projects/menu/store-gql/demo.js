import { apolloProvider } from '@/projects/apollo.js'
/**
 * *query 方法
 */
export const fetchXXX = async function({ commit, state }, pthis) {
  try {
    const { data } = await apolloProvider.clients.org.query({
      query: state.test.orgByCoBo,
      variables: {
        token: this.state.menu.token,
        pageNo: 1,
        pageSize: 10
      },
      fetchPolicy: 'network-only'
    })
    return data
  } catch (error) {
    return error
  }
}

/**
 * 动态查询
 */
export const apFetchXXX = async function({ commit, state }, vari) {
  try {

  } catch (error) {

  }
}

/**
 *  *mutate
 */
export const mutateXXX = async function({ commit, state }, pthis) {
  try {
    const { data } = await apolloProvider.clients.org.mutate({
      mutation: state.test.orgByCoBo,
      variables: {
        token: this.state.menu.token,
        pageNo: 1,
        pageSize: 10
      },
      fetchPolicy: 'network-only'
    })
    return data
  } catch (error) {
    return error
  }
}
