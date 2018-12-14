import * as orgAction from './actions/org-action'
import * as offerAction from './actions/offer-action'
import * as areaAction from './actions/area-action'
import * as authAction from './actions/auth-action'
import * as menuAction from './actions/menu-action'
import * as messageAction from './actions/message-action'
import * as personAction from './actions/person-action'
import * as taskAction from './actions/task-action'
import * as getters from './getters'
import state from './state'

export default {
  actions: {
    ...orgAction,
    ...offerAction,
    ...areaAction,
    ...authAction,
    ...menuAction,
    ...messageAction,
    ...personAction,
    ...taskAction
  },
  state
}
