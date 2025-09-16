// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://51.250.123.41:3005',
//         changeOrigin: true,
//         secure: false,
//       }
//     },
//   },
// });

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/new_game_card/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://51.250.123.41:3005',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})

