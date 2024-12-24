import { Db } from 'rethinkdb';

import { ActualTables, tableNames } from './types/ActualTables';

export const getTables = (db: Db) =>
	tableNames.reduce(
		(o, t) => ({
			...o,
			[t]: db.table(t),
		}),
		{}
	) as ActualTables;
