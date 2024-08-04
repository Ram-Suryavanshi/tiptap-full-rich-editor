import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['src/index.ts'],
  sourcemap: false,
  dts: false,
  clean: true,
  minify: true,
});
