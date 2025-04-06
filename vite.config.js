import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Green-Thumb',
        short_name: 'GreenThumb',
        start_url: '/',
        display: 'standalone',
        background_color: '#121212',
        theme_color: '#0f4a73',
        icons: [
          {
            src: '/icons/gicon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/gicon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ]
      }
    })

  ],
})
