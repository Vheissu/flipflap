import { defineConfig } from 'vite';
import aurelia from '@aurelia/vite-plugin';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  server: {
    open: !process.env.CI,
    port: 9000,
  },
  esbuild: {
    target: 'es2022',
  },
  plugins: [
    aurelia({ useDev: true }),
    nodePolyfills(),
  ],
  publicDir: 'static',
});
