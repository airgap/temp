import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';

export const buildTableCreationCommand = (
	tableName: string,
	model: PostgresTableModel<PostgresRecordModel>,
) => {
	const { schema } = model;
	const required = 'required' in schema ? schema.required : [];
	const columns =
		'properties' in schema
			? Object.entries(schema.properties)
					.map(([columnName, columnSchema]) => {
						const columnType = mapColumnType(columnName, columnSchema);
						const notNull = required.includes(columnName) ? ' NOT NULL' : '';
						return `"${columnName}" ${columnType}${notNull}`;
					})
					.join(', ')
			: '';
	const { primaryKey } = model;
	const primary = primaryKey
		? `, PRIMARY KEY (${[primaryKey]
				.flat()
				.map((k) => `"${k}"`)
				.join(', ')})`
		: '';
	const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns} ${primary});`;
	return createTableQuery;
};
