import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  base: './',
  server: {
    port: 5503,
    strictPort: false,
    host: true, // Listen on 0.0.0.0 for mobile/network access
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    rollupOptions: {
      input: {
        main: 'index.html',
        test: 'test.html',
      },
      output: {
        entryFileNames: 'js/game-[hash].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'assets/**/*',
          dest: 'assets',
          structured: true,
        },
        {
          src: 'src/config/themes/**/*',
          dest: 'src/config/themes',
          structured: true,
        },
        {
          src: 'src/config/game/**/*',
          dest: 'src/config/game',
          structured: true,
        },
      ],
    }),
  ],
});
