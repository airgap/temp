import type { Configuration } from 'webpack';
import TerserPlugin from 'terser-webpack-plugin';
import { TsconfigPathsPlugin } from 'tsconfig-paths-webpack-plugin';
import { join } from 'path';

export default (x: Configuration): Configuration => ({
	...x,
	mode: 'production',
	entry: './libs/routes/get-current-user/src/index.ts',
	resolve: {
		plugins: [
			new TsconfigPathsPlugin({
				configFile: join(__dirname, '../../../tsconfig.base.json'),
			}),
		],
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				test: /\.js(\?.*)?$/i,
			}),
			new TerserPlugin({
				test: /\.ts(\?.*)?$/i,
			}),
		],
	},
	module: {
		rules: [
			{
				test: /\.node$/,
				loader: 'node-loader',
			},
		],
	},
});
