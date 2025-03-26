import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'date-fns/_lib/format/longFormatters': 'date-fns/esm/_lib/format/longFormatters/index.js'
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
