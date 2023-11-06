import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    minify: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        frame_chessboard: resolve(
          __dirname,
          'src/frames/chessboard/chessboard.html',
        ),
        frame_emoji: resolve(
          __dirname,
          'src/frames/emoji/emoji.html',
        ),
      },
    },
  },
})
