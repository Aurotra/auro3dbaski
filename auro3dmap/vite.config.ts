import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  // Prod build auro3dbaski.com/map altına ters-proxy ile gömülüyor; dev
  // sunucusunda ise kök yolda kalması gerekiyor (npm run dev http://localhost:5173/).
  base: command === 'build' ? '/map/' : '/',
  plugins: [react()],
  // maplibre-gl kendi web worker'ını yükler; dep optimizer worker dosyasını bozuyor
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8001',
        changeOrigin: true,
      },
    },
  },
}))
