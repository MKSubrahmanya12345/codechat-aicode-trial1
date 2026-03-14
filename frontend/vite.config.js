import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ??$$$ Vite config with proxy to backend API - force port 5173
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false, // ??$$$ allow fallback if 5173 is taken
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
