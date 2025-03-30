import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost'
    },
    // Allow all hosts to access the dev server
    allowedHosts: 'all'
  }
})