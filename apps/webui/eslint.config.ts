import baseConfig from '../../eslint.config.ts';

export default [
	...baseConfig,
	{
		files: ['**/*.ts', '**/*.svelte'],
		rules: {},
	},
];
