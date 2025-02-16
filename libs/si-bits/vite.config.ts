/// <reference types='vitest' />
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { nxCopyAssetsPlugin } from '@nx/vite/plugins/nx-copy-assets.plugin';
import preprocess from 'svelte-preprocess';

export default defineConfig({
	root: __dirname,
	cacheDir: '../../node_modules/.vite/libs/si-bits',
	plugins: [
		nxViteTsPaths(),
		nxCopyAssetsPlugin(['*.md']),
		dts({
			entryRoot: 'src',
			tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
		}),
		svelte({
			preprocess: preprocess(),
		}),
	],
	// Uncomment this if you are using workers.
	// worker: {
	//  plugins: [ nxViteTsPaths() ],
	// },
	// Configuration for building your library.
	// See: https://vitejs.dev/guide/build.html#library-mode
	build: {
		outDir: '../../dist/libs/si-bits',
		emptyOutDir: true,
		reportCompressedSize: true,
		commonjsOptions: {
			transformMixedEsModules: true,
		},
		lib: {
			// Could also be a dictionary or array of multiple entry points.
			entry: 'src/index.ts',
			name: '@lyku/si-bits',
			fileName: 'index',
			// Change this to the formats you want to support.
			// Don't forget to update your package.json as well.
			formats: ['es', 'cjs'],
		},
		minify: false,
		rollupOptions: {
			// External packages that should not be bundled into your library.
			external: [],
		},
	},
	// Add resolve configuration for SVG files
	resolve: {
		alias: {
			'@assets': path.resolve(__dirname, 'src/assets'),
		},
	},
	// Add SVG handling configuration
	assetsInclude: ['**/*.svg', '**/*.png', '**/*.wav', '**/*.mp3'],
	// Add optimizeDeps configuration
	optimizeDeps: {
		include: [],
	},
	test: {
		watch: false,
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		reporters: ['default'],
		coverage: {
			reportsDirectory: '../../coverage/libs/si-bits',
			provider: 'v8',
		},
	},
});
