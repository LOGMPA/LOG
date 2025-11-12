import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// If publishing on GitHub Pages under a repo name, set BASE_PATH to '/<repo-name>/'
const BASE_PATH = process.env.GH_PAGES_BASE || '/'

export default defineConfig({
  plugins: [react()],
  base: BASE_PATH,
})
