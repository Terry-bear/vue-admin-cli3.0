<template>
    <router-view/>
</template>
<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator'
@Component({})
export default class LayoutEmpty extends Vue {
  private name: string = 'LayoutEmpty'
}
</script>
