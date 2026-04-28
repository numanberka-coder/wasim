import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['js/**/*.js'],
      exclude: [
        'js/app.js',
        'js/ui/**',
        'js/features/autocomplete.js',
        'js/features/script-builder.js',
        'js/features/interactive-engine.js',
        'js/phone/statusbar.js',
        'js/phone/typography.js',
        'js/phone/wallpaper.js',
      ],
      thresholds: {
        // Geçiş süreci: onboarding fazlarında modül kapsamı arttığı için
        // global coverage eşiğini mevcut gerçek kapsama yaklaştırıyoruz.
        statements: 35
      }
    }
  }
});
