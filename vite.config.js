import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // ── Configuración requerida por Tauri v2 ──────────────────────────────
  // Tauri espera un puerto fijo y no abre el browser automáticamente
  server: {
    port: 5173,
    strictPort: true,
    host: process.env.TAURI_DEV_HOST || 'localhost',

    // Proxy al backend Python (ajustar puerto según el backend)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  // En modo Tauri usamos ES modules, no CommonJS
  build: {
    target: process.env.TAURI_ENV_PLATFORM === 'windows'
      ? 'chrome105'
      : 'safari13',
    // No minificar sourcemaps en dev
    minify: !process.env.TAURI_ENV_DEBUG ? 'esbuild' : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },

  // Variables de entorno que Tauri inyecta
  envPrefix: ['VITE_', 'TAURI_ENV_'],

  clearScreen: false,
})
