import * as path from 'path';
import { build } from 'bun';
import tsconfig from './tsconfig.base.json';
import { plugins } from './resolver';

const [, , entrypoint, outdir] = process.argv;

if (!entrypoint || !outdir) {
	console.error('Usage: bun run ibuild.ts <entrypoint> <outdir>');
	process.exit(1);
}

const sharedTsConfig = path.join(path.dirname(entrypoint), 'tsconfig.app.json');
const proc = Bun.spawn(
	['tsc', '--noEmit', '--pretty', '--project', sharedTsConfig],
	{
		stderr: 'pipe',
		stdout: 'pipe',
	}
);
const stdout = await new Response(proc.stdout).text();
const stderr = await new Response(proc.stderr).text();
const typecheck = await proc.exited;

if (typecheck !== 0) {
	console.error('\n🔴 Type checking failed:\n' + (stdout || stderr).trim());
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
	minify: true,
});

if (!result.success) {
	console.error('\n🔴 Build failed:', result.logs);
	process.exit(1);
}
