<template>
  <div>
    <el-popover trigger="hover" placement="top" visible-arrow=false>
      <slot></slot>
      <div slot="reference" class="name-wrapper">
        {{itemData | longStrFormat}}
      </div>
    </el-popover>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
Vue.filter('longStrFormat', function(str: any) {
  if (str !== null && str !== undefined) {
        if (str.length > 8) {
          str = str.slice(0, 8) + '...'
          return str
        } else { return str }
      } else { return str }
})
export default class ShowItem extends Vue {
  @Prop() public itemData: any
}
</script>

<style scoped>
</style>
