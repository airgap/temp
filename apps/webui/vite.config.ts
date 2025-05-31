import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import svgLoader from 'vite-svg-loader';
import vps from '@sveltejs/vite-plugin-svelte';
import { visualizer } from 'rollup-plugin-visualizer';
import { svelteKitEnv } from './src/env-plugin.js';

export default defineConfig({
	server: {
		fs: {
			allow: ['.'],
		},
	},
	root: __dirname,
	cacheDir: '../../node_modules/.vite/apps/webui',
	plugins: [
		nxViteTsPaths(),
		sveltekit(),
		nxCopyAssetsPlugin(['*.md', '*.svg', '*.png']),
		svgLoader(),
		svelteKitEnv(),
		// visualizer({ open: false, filename: 'bundle-visualization.html' })
	],
	build: {
		outDir: '../../dist/apps/webui',
		emptyOutDir: true,
		rollupOptions: {
			// Mark Cloudflare-specific modules as external to prevent bundling
			external: ['cloudflare:sockets'],
			output: {
				// Handle external modules in a way compatible with Cloudflare Workers
				manualChunks: (id) => {
					// Create separate chunks for large third-party libraries
					if (id.includes('node_modules')) {
						if (id.includes('@tiptap')) {
							return 'vendor_tiptap';
						}
						if (id.includes('tus-js-client')) {
							return 'vendor_tus';
						}
						if (id.includes('@msgpack')) {
							return 'vendor_msgpack';
						}
						if (id.includes('vue') || id.includes('prosemirror')) {
							return 'vendor_vue_prosemirror';
						}
						if (id.includes('gsap')) {
							return 'vendor_gsap';
						}

						return 'vendor'; // All other node_modules
					}
				},
			},
			treeshake: true,
		},
		// Ensure no Node.js APIs are used in client code
		target: 'es2022',
	},
	// Prevent Node.js built-ins from being bundled
	resolve: {
		conditions: ['browser', 'module', 'jsnext:main', 'jsnext'],
	},
	optimizeDeps: {
		exclude: ['kysely', 'pg', '@neondatabase/serverless'],
	},
	// Let SvelteKit handle server/client code separation
	ssr: {
		noExternal: ['@lyku/db-config', '@neondatabase/serverless'],
	},
});
