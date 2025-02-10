import baseConfig from '../../eslint.config.ts';

export default [
	...baseConfig,
	{
		files: ['**/*.json'],
		rules: {
			'@nx/dependency-checks': [
				'error',
				{
					ignoredFiles: [
						'{projectRoot}/eslint.config.{js,cjs,mjs}',
						'{projectRoot}/vite.config.{js,ts,mjs,mts}',
					],
				},
			],
		},
		languageOptions: {
			parser: require('jsonc-eslint-parser'),
		},
	},
];
