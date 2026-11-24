/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { minimal2023Preset } from '@vite-pwa/assets-generator/config';
import path from 'path';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    // PWA installable (J6 24f) : manifeste, service worker et icônes générées depuis public/icon.svg
    VitePWA({
      // Mise à jour proposée, jamais imposée : un rechargement en pleine nuit couperait le joueur
      registerType: 'prompt',
      // Icônes générées au build (favicon, 64/192/512, maskable, Apple) et liens ajoutés au <head>
      pwaAssets: {
        image: 'public/icon.svg',
        htmlPreset: '2023',
        // index.html porte déjà la couleur de thème
        injectThemeColor: false,
        overrideManifestIcons: true,
        preset: {
          ...minimal2023Preset,
          maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0e1016' } },
          apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#0e1016' } },
        },
      },
      manifest: {
        name: 'Blood on the Clocktower — compagnon',
        short_name: 'BotC',
        description: 'Le compagnon de table : nuits, votes et grimoire sur téléphone.',
        lang: 'fr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0e1016',
        theme_color: '#0e1016',
      },
      workbox: {
        // Coque de l'appli en cache : elle s'ouvre même sans réseau, les données restent en ligne
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        // L'API et sa documentation ne passent jamais par le cache
        navigateFallbackDenylist: [/^\/api/, /^\/swagger-ui/, /^\/api-docs/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Un alias par couche (app → pages → features → common) : chaque import montre sa couche
      '@app': path.resolve(dirname, './src/app'),
      '@pages': path.resolve(dirname, './src/pages'),
      '@auth': path.resolve(dirname, './src/features/auth'),
      '@games': path.resolve(dirname, './src/features/games'),
      '@scripts': path.resolve(dirname, './src/features/scripts'),
      '@common': path.resolve(dirname, './src/common'),
    },
  },
  server: {
    proxy: {
      // API Rust (BotC-back) : même origine pour le cookie de refresh (SameSite=Strict)
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // WebSocket temps réel (/api/ws)
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@common/styles/colors" as *; @use "@common/styles/variables" as *; @use "@common/styles/fonts" as *; @use "@common/styles/mixins" as *;`,
      },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: 'chromium',
              },
            ],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
