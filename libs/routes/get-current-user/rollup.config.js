import { withNx } from '@nx/rollup/with-nx.js';

export default withNx(
	{
		main: './src/index.ts',
		outputPath: '../../../dist/libs/routes/get-current-user',
		tsConfig: './tsconfig.lib.json',
		compiler: 'babel',
		external: [],
		format: ['esm'],
		assets: [{ input: '.', output: '.', glob: 'README.md' }],
	},
);
