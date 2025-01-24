import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default [
	{
		input: './serve.ts', // Your entry point
		output: {
			dir: '../../dist/apps/routes/delete-friendship', // Output directory
			format: 'esm', // Use ESM format for tree shaking
			sourcemap: true, // Optional: for debugging
		},
		plugins: [
			resolve(), // Resolves node_modules
			commonjs(), // Converts CommonJS modules to ES6
			terser(), // Optional: for minification
		],
		// external: id => /^@lyku\//.test(id), // Exclude specific dependencies if needed
	},
];
