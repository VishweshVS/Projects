import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // Changed from '@vitejs/react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})