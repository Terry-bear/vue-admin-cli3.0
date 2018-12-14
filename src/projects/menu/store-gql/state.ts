import menu from '@/projects/menu/store-menu/state.ts'

export interface State {
  token: string
  tokenObj: any
}
const state: State = {
  token: menu.token,
  tokenObj: menu.tokenObj
}

export default state
