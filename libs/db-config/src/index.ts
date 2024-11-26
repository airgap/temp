import { DatabaseModel } from 'from-schema';
import * as tables from './tables';
export * from './tables';

export const dbConfig = {
	type: 'database',
	tables,
} satisfies DatabaseModel<typeof tables>;
// console.log('dbConfig', dbConfig);