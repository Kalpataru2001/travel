import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',    // Silently update SW in background; new version activates on next visit
      injectRegister: 'auto',        // Auto-inject SW registration script into index.html

      // Point to the manifest we manage ourselves in public/
      manifest: false,               // We have our own public/manifest.json — don't auto-generate one

      workbox: {
        // Files to pre-cache when the SW installs (all built assets)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],

        // Runtime caching strategies
        runtimeCaching: [
          // 1. Google Fonts — cache-first (fonts never change for a given URL)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 2. Unsplash / Picsum images — stale-while-revalidate (show cached, refresh in bg)
          {
            urlPattern: /^https:\/\/(images\.unsplash\.com|picsum\.photos)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'destination-images-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // 3. OpenWeatherMap — network-first with cache fallback (data should be fresh, but usable offline)
          {
            urlPattern: /^https:\/\/api\.openweathermap\.org\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'weather-api-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 3 }, // 3 hours
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 5,
            },
          },

          // 4. Exchange rates API — network-first (already has 24h localStorage cache)
          {
            urlPattern: /^https:\/\/open\.er-api\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'exchange-rates-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }, // 24 hours
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },

      devOptions: {
        enabled: false, // Don't run SW in dev to avoid stale-cache confusion during development
      },
    }),
  ],
  build: {
    // Raise the warning limit slightly — we are code-splitting now
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // Split vendor libs into separate cacheable chunks using a function to avoid type conflicts
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('leaflet')) {
              return 'vendor-maps';
            }
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            return 'vendor-others';
          }
        },
      },
    },
  },
})
