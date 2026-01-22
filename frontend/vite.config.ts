import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/ai-paper-porter/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
