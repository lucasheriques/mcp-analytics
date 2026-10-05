import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    base: process.env.BASE_PATH ?? '/mcp-analytics/',
    plugins: [react(), tailwindcss()],
})
