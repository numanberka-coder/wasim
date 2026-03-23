import { defineConfig } from 'vite';

export default defineConfig({
  root: './',
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsInlineLimit: 100000000
  }
});
