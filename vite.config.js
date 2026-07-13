import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  root: './',
  base: './',
  plugins: [viteSingleFile()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 100000000
  }
});
