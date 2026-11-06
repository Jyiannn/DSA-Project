import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from C:\xampp\htdocs\DSA-Project, so assets and routes live under /DSA-Project/.
export default defineConfig({
  plugins: [react()],
  base: '/DSA-Project/',
  // `npm run dev` still talks to the deployed PHP API through Apache.
  server: {
    proxy: {
      '/DSA-Project/api': { target: 'http://localhost', changeOrigin: true },
    },
  },
});
