import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'
// https://vite.dev/config/
export default defineConfig({
  // base: '/buyer/',
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg', 
        'favicon.ico', 
        'robots.txt', 
        'apple-touch-icon.png'
      ],
      manifest: {
        name: 'Bideasy Buyer Platform',
        short_name: 'Buyer Platform',
        description: 'Buyer Platform',
        theme_color: '#ffffff',
        start_url: '/buyer/',   // 👈 important
        scope: '/buyer/',    
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
