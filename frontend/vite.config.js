import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração do Vite para garantir que ele use a raiz correta
export default defineConfig({
  root: '.', // diz explicitamente que a raiz é a pasta frontend
  plugins: [react()],
  server: {
    port: 5173,
  }
})
