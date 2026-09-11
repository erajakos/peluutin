import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

const PITCH_GREEN = '#0F3324'

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      /*
       * A new version activates as soon as it has downloaded, with no message
       * round-trip to race against page load. What it must never do is reload
       * the page under a coach, since the match lives in memory: App.vue only
       * reloads from the start screen, and otherwise leaves it to the next launch.
       */
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Peluutin',
        short_name: 'Peluutin',
        description:
          'Peluuttajan työkalu juniorijalkapalloon: reilu peliaika, vaihdot, maalit ja kortit.',
        lang: 'fi',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: PITCH_GREEN,
        theme_color: PITCH_GREEN,
        categories: ['sports', 'utilities'],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Everything the app needs is precached, fonts included, so it opens
        // on a pitch with no reception once it has been loaded once.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
