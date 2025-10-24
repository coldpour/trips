import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/trips/',
  server: {
    host: true, // or '0.0.0.0'
  },
})
