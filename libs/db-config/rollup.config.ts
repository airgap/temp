import { RollupOptions } from 'rollup';
import string from 'rollup-plugin-string-import';

const config: RollupOptions = {
	plugins: [
		string({
			include: '**/*.sql',
		}),
	],
};

export default config;
