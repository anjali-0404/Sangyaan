import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = process.env.VITE_BACKEND_URL || 'http://localhost:8000'

// Browser calls /api/*; Vite forwards to FastAPI. xfwd passes the real client IP so rate limits are per-user.
const proxy = {
  '/api': { target: backend, changeOrigin: true, xfwd: true, rewrite: p => p.replace(/^\/api/, '') },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    // Dev: the browser calls /api/*, Vite forwards to the FastAPI backend (no CORS needed).
    allowedHosts: true, // ngrok / tunnel hostnames
    proxy,
  },
  // `npm run build && npm run preview` - what we expose through ngrok
  preview: { port: 5173, host: true, allowedHosts: true, proxy },
})
