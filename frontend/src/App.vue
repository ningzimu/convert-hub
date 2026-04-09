<template>
  <div id="app" class="app-shell">
    <router-view/>
  </div>
</template>

<style>
#app.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 34%),
    radial-gradient(circle at top right, rgba(14, 165, 233, 0.08), transparent 28%);
}
</style>
