/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
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
