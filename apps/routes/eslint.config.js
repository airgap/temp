const baseConfig = require('../../eslint.config.js');
const jsoncParser = require('jsonc-eslint-parser');

module.exports = [
	...baseConfig,
	{
		files: ['**/*.json'],
		rules: {
			'@nx/dependency-checks': [
				'error',
				{
					ignoredFiles: ['{projectRoot}/eslint.config.{js,cjs,mjs}'],
				},
			],
		},
		languageOptions: {
			parser: jsoncParser,
		},
	},
];
