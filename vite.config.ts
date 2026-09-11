import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'node:path'

const srcPath = path.resolve(import.meta.dirname, 'src')

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      api: path.resolve(srcPath, 'api'),
      components: path.resolve(srcPath, 'components'),
      constants: path.resolve(srcPath, 'constants'),
      interfaces: path.resolve(srcPath, 'interfaces'),
      pages: path.resolve(srcPath, 'pages'),
      store: path.resolve(srcPath, 'store'),
      utils: path.resolve(srcPath, 'utils'),
    },
  },
})
