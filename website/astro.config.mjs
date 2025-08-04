// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://promptinjectionator.com',
  outDir: '../docs',
  build: {
    assets: '_astro'
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsDir: '_astro'
    }
  },
  integrations: [react()]
});
