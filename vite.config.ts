import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3003,
      hmr: {
        port: 24682,
      },
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    base: './',
  };
});
