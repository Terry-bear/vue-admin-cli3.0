<template>
  <div id="container">
    <div class="search bar">
      <form>
        <input type="text" placeholder="搜索...">
        <button type="submit">
          <i class="el-icon-search" style="color: #fff;"></i>
        </button>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
@Component({})
export default class SearchIcon extends Vue {}
</script>

<style scoped>

form {
  position: relative;
  width: 150px;
  margin: 0 auto;
}

input,
button {
  border: none;
  outline: none;
  height: 25px;
  margin: 7px 0;
}

input {
  width: 100%;
  padding-left: 13px;
}
input[placeholder] {
  color: rgb(197, 197, 197);
}

input::-webkit-input-placeholder,
textarea::-webkit-input-placeholder {
  /* WebKit browsers */
  color: rgb(197, 197, 197);
}
input:-moz-placeholder,
textarea:-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: rgb(197, 197, 197);
}
input::-moz-placeholder,
textarea::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: rgb(197, 197, 197);
}
input:-ms-input-placeholder,
textarea:-ms-input-placeholder {
  /* Internet Explorer 10+ */
  color: rgb(197, 197, 197);
}

button {
  width: 12px;
  cursor: pointer;
  position: absolute;
}

/*搜索框*/

.bar {
  background: #343743;
}

.bar form {
  height: 42px;
}

.bar input {
  width: 170px;
  border-radius: 5px;
  background-color: #434859;
  transition: 0.3s linear;
  float: right;
}

.bar input:hover,
.bar input:focus {
  border: 1px solid #4be6fa;
  background: #222d3c;
  width: 270px;
  box-sizing: border-box;
}

.bar button {
  background: none;
  top: 0px;
  right: 10px;
}

.bar button:before {
  color: #effdff;
}
</style>
