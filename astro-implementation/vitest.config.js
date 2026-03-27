import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,mjs}'],
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
})
