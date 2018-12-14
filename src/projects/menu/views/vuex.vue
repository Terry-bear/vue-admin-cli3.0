<template>
  <div></div>
</template>
<script lang="ts">
import { Vue, Component, Watch, Prop, Model, Provide, Inject } from 'vue-property-decorator'
import {
  State,
  Getter,
  Action,
  Mutation,
  namespace
} from 'vuex-class'
const someModule = namespace('path/to/module')
@Component({})
export default class Vuexs extends Vue {
  @State('foo') public stateFoo: any
  @State(state => state.bar) public stateBar: any
  @Getter('foo') public getterFoo: any
  @Action('foo') public actionFoo: any
  @Mutation('foo') public mutationFoo: any
  @someModule.Getter('foo') public moduleGetterFoo: any

  // If the argument is omitted, use the property name
  // for each state/getter/action/mutation type
  @State public foo: any
  @Getter public bar: any
  @Action public baz: any
  @Mutation public qux: any

  public created() {
    // this.stateFoo // -> store.state.foo
    // this.stateBar // -> store.state.bar
    // this.getterFoo // -> store.getters.foo
    this.actionFoo({ value: true }) // -> store.dispatch('foo', { value: true })
    this.mutationFoo({ value: true }) // -> store.commit('foo', { value: true })
    // this.moduleGetterFoo // -> store.getters['path/to/module/foo']
  }
}
</script>

<style lang="scss" scoped>
</style>
