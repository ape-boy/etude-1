import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/devportal\/ai-chatops/, '')
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})