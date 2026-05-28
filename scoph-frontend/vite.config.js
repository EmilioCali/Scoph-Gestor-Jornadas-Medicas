//Este archivo es la configuracion de vite, donde se importan los plugins necesarios para el proyecto. (ACA LE DECIMOS EL COMO QUEREMOS QUE FUNCINE EL PROYECTO)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss()
  ],
})
