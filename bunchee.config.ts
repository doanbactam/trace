import type { Config } from 'bunchee'

const config: Config = {
  entry: ['src/index.ts', 'src/highlight/index.ts', 'src/entries/config.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'fs', 'path', 'os', 'sugar-high'],
  cwd: process.cwd()
}

export default config
