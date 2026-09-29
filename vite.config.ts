import { defineConfig } from 'vite'

// Base = subruta de GitHub Pages (adriasantacreu.github.io/banc-proves-oficials/)
export default defineConfig({
  base: '/banc-proves-oficials/',
  build: { target: 'es2022' },
})
