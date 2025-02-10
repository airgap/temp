// const baseConfig = require('../../eslint.config.ts');
import baseConfig from '../../eslint.config.ts';
import parser from 'jsonc-eslint-parser';
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
			parser,
		},
	},
];
