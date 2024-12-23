import * as path from 'path';
import { build } from 'bun';
import tsconfig from './tsconfig.base.json';
import { plugins } from './resolver';
const [,, entrypoint, outdir] = process.argv;

if (!entrypoint || !outdir) {
  console.error('Usage: bun run ibuild.ts <entrypoint> <outdir>');
  process.exit(1);
}

const result = await build({
  entrypoints: [entrypoint],
  outdir,
  target: 'bun',
  format: 'esm',
  splitting: false,
  sourcemap: 'external',
  plugins: plugins,
  minify: true
});

if (!result.success) {
  console.error('iBuild failed:', result.logs);
  process.exit(1);
}
