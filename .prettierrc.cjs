// .prettierrc.js
module.exports = {
	plugins: [require('prettier-plugin-svelte')],
	singleQuote: true,
	tabWidth: 2,
	useTabs: true,
	trailingComma: 'all',
	overrides: [
		{
			files: ['*.ts.template'],
			options: {
				parser: 'typescript',
			},
		},
		{
			files: ['*.json.template'],
			options: {
				parser: 'json',
			},
		},
		{
			files: ['*.svelte'],
			options: {
				parser: 'svelte',
			},
		},
	],
};
