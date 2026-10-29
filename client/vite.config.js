import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the build works under any sub-path (e.g. GitHub Pages /repo-name/).
  base: './',
  server: {
    // Dev: forward API calls to the Express server.
    proxy: { '/api': 'http://localhost:5000' },
  },
})
