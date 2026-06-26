import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://<username>.github.io/aidiancan/
export default defineConfig({
  base: '/aidiancan/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: '今天吃啥',
        short_name: '今天吃啥',
        description: '饭点快速选择附近日常餐饮',
        theme_color: '#1677ff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/aidiancan/',
        scope: '/aidiancan/',
        icons: [
          {
            src: 'pwa-icon.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'pwa-icon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/aidiancan/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/restapi\.amap\.com\//,
            handler: 'NetworkOnly',
            options: {
              cacheName: 'amap-network-only',
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
