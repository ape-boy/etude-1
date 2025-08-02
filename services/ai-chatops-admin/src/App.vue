<template>
  <div id="app">
    <AdminLayout>
      <router-view />
    </AdminLayout>
  </div>
</template>

<script>
import AdminLayout from '@/components/AdminLayout.vue'

export default {
  name: 'App',
  components: {
    AdminLayout
  }
}
</script>

<style>
/* Global admin styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f8fafc;
}

#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>