import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      '/api': {
        // El front solo pide /api/... (relativo) y Vite lo
        // reenvía al backend TechFix. En desarrollo usamos el
        // mismo backend desplegado que render.yaml en producción,
        // así no hace falta levantar la API en local.
        target: 'https://techfix-backend-z431.onrender.com',
        changeOrigin: true,
        secure: false,
        // Render (plan free) duerme la API: damos margen para
        // que despierte en el primer request.
        timeout: 120000,
        proxyTimeout: 120000,
      },
    },
  },
})
