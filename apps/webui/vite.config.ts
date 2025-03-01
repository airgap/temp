import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import svgLoader from 'vite-svg-loader';
import vps from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	server: {
		fs: {
			allow: ['.'],
		},
	},
	root: __dirname,
	cacheDir: '../../node_modules/.vite/apps/webui',
	plugins: [
		sveltekit(),
		nxViteTsPaths(),
		nxCopyAssetsPlugin(['*.md', '*.svg', '*.png']),
		svgLoader(),
	],
	build: {
		outDir: '../../dist/apps/webui',
		emptyOutDir: true,
		rollupOptions: {
			output: {
				manualChunks: undefined,
			},
		},
	},
	test: {
		watch: false,
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		reporters: ['default'],
		coverage: { reportsDirectory: '../../coverage/apps/webui', provider: 'v8' },
	},
});
