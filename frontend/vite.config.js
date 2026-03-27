/**
 * vite.config.js
 * ─────────────────────────────────────────────────
 * Configuration principale de Vite.
 *
 * Proxy :
 *   Toute requête commençant par /api est redirigée
 *   vers le serveur backend sur le port 3001.
 *
 *   Cela permet d'écrire dans le code React :
 *     axios.get('/api/users')       ✅
 *   Au lieu de :
 *     axios.get('http://localhost:3001/api/users')  ❌
 *
 *   Et évite les erreurs CORS en développement.
 * ─────────────────────────────────────────────────
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Redirige /api/* → http://localhost:3001/api/*
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
