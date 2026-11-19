import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    base: process.env.BASE_PATH ?? '/mcp-analytics/',
    plugins: [react(), tailwindcss()],
    // Two pages share one app: the home page and the 8-bit tale.
    build: { rollupOptions: { input: { main: 'index.html', tale: 'tale/index.html' } } },
})
