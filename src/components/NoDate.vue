<template>
  <div class="con">
    <div class="box">
      <img src="../projects/menu/assets/img/date.png" alt="">
      <p style="line-height: 30px;text-align: center">暂无数据</p>
    </div>
  </div>
</template>

<script lang="ts">
import Component from 'vue-class-component'
import { Vue, Watch, Prop } from 'vue-property-decorator'
@Component({})
export default class NoDate extends Vue {
  private name: string = 'no-date'
  public data() {
    return {
      name: this.name
    }
  }
}
</script>

<style lang="scss" scoped>
.con{
  width: 100%;
  height: 100%;
  position: relative;
}
.box{
  position: absolute;
  width: 150px;
  height: 180px;
  top: 50%;
  left: 50%;
  margin: -75px 0 0 -90px;
  >img{
    width: 100%;
    height: 150px;
  }
  >p{
    font-size: 14px;
  }
}
</style>
