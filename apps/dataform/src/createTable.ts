import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';

export async function createTable<
	T extends PostgresTableModel<PostgresRecordModel>
>(tableName: string, schema: T) {
	// console.log('creating table', tableName, schema, 'tonka');
	const required = 'required' in schema ? (schema.required as string[]) : [];
	const columns =
		'properties' in schema && schema.properties
			? Object.entries(schema.properties)
					.map(([columnName, columnSchema]) => {
						const columnType = mapColumnType(columnName, columnSchema);
						const notNull = required.includes(columnName) ? ' NOT NULL' : '';
						return `"${columnName}" ${columnType}${notNull}`;
					})
					.join(', ')
			: '';

	const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});`;
	console.log(createTableQuery);
	// await client.query(createTableQuery); // Execute the create table query
}
