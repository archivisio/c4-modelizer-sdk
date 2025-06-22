import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'C4ModelizerSDK',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm.js' : 'js'}`
    },
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'zustand', '@xyflow/react'],
      output: {
        inlineDynamicImports: false,
        manualChunks: undefined,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          zustand: 'zustand',
          '@xyflow/react': 'ReactFlow'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@ui': resolve(__dirname, 'src/ui'),
      '@utils': resolve(__dirname, 'src/utils'),
    }
  }
});