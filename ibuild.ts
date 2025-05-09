// build.js
const esbuild = require('esbuild');
const path = require('path');

const entrypoint = process.argv[2] || 'src/index.js'; // Default entry point
const outdir = process.argv[3] || 'dist'; // Default output directory

esbuild
	.build({
		entryPoints: [entrypoint],
		bundle: true, // Enable bundling
		outdir: outdir,
		format: 'esm', // Use ES module format
		splitting: true, // Enable code splitting
		target: 'esnext', // Use esnext for compatibility with Bun
		platform: 'node',
		// minify: true, // Enables tree shaking
		sourcemap: true, // Optional: Generate source maps for easier debugging
		treeShaking: true, // Ensure tree shaking is enabled
		metafile: true, // Generate a metafile for analysis

		// Simply mark all packages as external to allow the router approach to work
		external: [
			'@lyku/*',
			'kysely',
			'@clickhouse/client',
			'@elastic/elasticsearch',
		],
	})
	.then(() => {
		// console.log('Built');
	})
	.catch((err: Error) => {
		console.error('Build failed:', err);
		process.exit(1);
	});
