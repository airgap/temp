const TerserPlugin = require('terser-webpack-plugin');
module.exports = (x) => ({
	...x,
	mode: 'production',
	entry: './apps/monolith/src/main.ts',
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				test: /\.js(\?.*)?$/i,
			}),
		],
	},
	module: {
		rules: [
			// 		{
			// 			test: /\.js$/,
			// 			use: ['source-map-loader'],
			// 			enforce: 'pre',
			// 			exclude: /node_modules/,
			// 		},
			// ... your other rules
			{
				test: /\.node$/,
				loader: 'node-loader',
			},
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	// stats: {
	// 	warningsFilter: /Module Warning/,
	// },
});
