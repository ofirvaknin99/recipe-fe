import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // You can set a port for local dev server
  },
  // Ensure VITE_GEMINI_API_KEY is available client-side
  // Vite automatically exposes env vars prefixed with VITE_ from .env files
  // For other env vars (like from hosting provider), they need to be prefixed with VITE_
  // No specific define needed here if you use .env and VITE_ prefix correctly.
})
