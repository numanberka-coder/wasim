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
        statements: 40
      }
    }
  }
});
