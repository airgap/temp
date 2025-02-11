import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Ensure routes are properly handled
			routes: {
				include: ['/*'],
				exclude: [],
			},
			// Ensure proper function binding
			functionPerRoute: true,
		}),
		files: {
			appTemplate: 'apps/webui/src/app.html',
			routes: 'apps/webui/src/routes',
			assets: 'apps/webui/static',
		},
		outDir: 'dist/apps/webui',
		csrf: {
			checkOrigin: false,
		},
	},
	preprocess: vitePreprocess(),
};

export default config;
