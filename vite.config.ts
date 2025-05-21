
import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react-swc'
import { componentTagger } from 'lovable-tagger'

export default defineConfig(({ mode }) => ({
  base: '/json-doc-weaver/',
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'docs',
  },
  server: {
    port: 8080
  }
}))
