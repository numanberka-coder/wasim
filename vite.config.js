import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// build:portable hedefinde head'deki PWA blogunu (marker'lar arasi) tamamen cikarir.
function stripPwaTags() {
  return {
    name: 'strip-pwa-tags',
    enforce: 'pre',
    transformIndexHtml(html) {
      return html.replace(/[ \t]*<!-- PWA:START[\s\S]*?<!-- PWA:END -->\n?/g, '');
    }
  };
}

// Iki hedef ayni kaynaktan beslenir, ayarlari mode ile ayrisir:
//   vite build --mode portable -> tek HTML dosya, PWA yok  (dist-portable/)
//   vite build --mode pwa      -> normal build + PWA       (dist-pwa/)
export default defineConfig(({ mode }) => {
  const isPortable = mode === 'portable';

  return {
    root: './',
    base: './',
    // Portable'da manifest/icon kopyalanmasin; PWA'da public/ oldugu gibi kopyalansin.
    publicDir: isPortable ? false : 'public',
    plugins: isPortable ? [viteSingleFile(), stripPwaTags()] : [],
    build: {
      outDir: isPortable ? 'dist-portable' : 'dist-pwa',
      emptyOutDir: true,
      sourcemap: false,
      // Portable'da her sey tek dosyaya gomulur; PWA'da normal ayrik ciktilar.
      assetsInlineLimit: isPortable ? 100000000 : 4096
    }
  };
});
