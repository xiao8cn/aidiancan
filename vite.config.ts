import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://<username>.github.io/aidiancan/
export default defineConfig({
  base: '/aidiancan/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
