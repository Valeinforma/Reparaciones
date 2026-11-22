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
        // reenvía al backend TechFix. Cambiando esta línea
        // cambiás de backend sin tocar código React.
        target: 'http://localhost:5137',
        changeOrigin: true,
        secure: false, // localhost es HTTP
      },
    },
  },
})
