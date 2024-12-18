import { PostgresDatabaseModel } from 'from-schema';
import * as tables from './tables';
export * from './tables';

export const dbConfig = {
	type: 'database',
	tables,
} satisfies PostgresDatabaseModel<typeof tables>;
// console.log('dbConfig', dbConfig);
