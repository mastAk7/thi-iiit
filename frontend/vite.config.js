import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  css: {
    postcss: './postcss.config.cjs'
  }
  ,server: {
    proxy: {
      // proxy any /api requests to the backend to keep cookies same-site during dev
      '/api': {
        target: process.env.VITE_API_PROXY || 'http://localhost:4001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      }
    }
  }
})
