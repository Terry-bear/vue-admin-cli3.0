<template>
  <div id="app" style='height: 100%;'>
    <transition mode="out-in" name="fade">
      <keep-alive>
        <router-view/>
      </keep-alive>
    </transition>
  </div>
</template>
<style>
html,
body {
  height: 100%;
  width: 100%;
}

@media screen and (max-width: 450px) and (min-width: 350px) {
  html, body {
    font-size: 12px;
  }
}
</style>
