import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: {
    cli: './src/node/cli.ts',
    index: './src/node/index.ts',
    dev: './src/node/dev.ts'
  },
  clean: true, // 清空之前的构建产物
  bundle: true,
  splitting: true,
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  shims: true // 注入一些 API 的 polyfill 代码，如 __dirname, __filename, import.meta 等等，保证这些 API 在 ESM 和 CJS 环境下的兼容性
  
});