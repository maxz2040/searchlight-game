import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Pokemon Searchlight Edition — kid-friendly iPad web game.
// Tailwind v4 via the Vite plugin (no postcss config needed).
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
