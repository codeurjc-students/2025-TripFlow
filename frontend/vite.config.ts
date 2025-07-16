/// <reference types="vitest" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    include: ['src/**/*.test.{ts,tsx}', 'tests/**/*.test.{ts,tsx}']
  },
  resolve: {
    alias: {
      '@': "/src",
      '@components': "/src/components",
      '@services': "/src/services",
      '@pages': "/src/pages",
      '@styles': "/src/styles"
    }
  }
})
