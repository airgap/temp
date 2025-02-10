import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs#compile-time-svelte-preprocess
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	compilerOptions: {
		// You can specify compiler options here
		// See https://svelte.dev/docs#compile-time-svelte-compile for details
	},

	// This is for SvelteKit specific settings
	kit: {
		adapter: adapter({
			routes: {
				include: ['/*'],
				exclude: [],
			},
			platformProxy: {
				configPath: 'wrangler.toml',
				environment: undefined,
				experimentalJsonConfig: false,
				persist: false,
			},
		}),
		alias: {
			$lib: './src/lib',
		},
	},
};

export default config;
