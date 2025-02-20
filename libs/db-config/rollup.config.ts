import { RollupOptions } from 'rollup';
import { readFileSync } from 'fs';

const config: RollupOptions = {
	plugins: [
		{
			name: 'sql',
			transform(code, id) {
				if (!id.endsWith('.sql')) return null;
				
				const content = readFileSync(id, 'utf8');
				return {
					code: `export default ${JSON.stringify(content)};`,
					map: null
				};
			}
		}
	]
};

export default config;
