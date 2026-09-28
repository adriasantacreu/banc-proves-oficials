import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// Base = subruta de GitHub Pages (adriasantacreu.github.io/banc-proves-oficials/)
export default defineConfig({
  base: '/banc-proves-oficials/',
  plugins: [tailwindcss()],
  build: {
    target: 'es2022',
  },
})
