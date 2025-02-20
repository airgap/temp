import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';

export async function createTable<
	T extends PostgresTableModel<PostgresRecordModel>
>(tableName: string, model: T) {
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

	const createTableQuery = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columns});`;
	console.log(createTableQuery);
	// await client.query(createTableQuery); // Execute the create table query

	// Generate index creation commands
	const indexQueries: string[] = [];
	if (model.indexes) {
		model.indexes.forEach((index, i) => {
			let indexColumns: string[];
			let indexName: string;

			if (typeof index === 'string') {
				// Single column index
				indexColumns = [`"${index}"`];
				indexName = `idx_${tableName}_${index}`;
			} else if (Array.isArray(index)) {
				// Multi-column index
				indexColumns = index.map((col) => `"${col}"`);
				indexName = `idx_${tableName}_${index.join('_')}`;
			} else {
				// Object format with optional custom name
				const cols = Array.isArray(index.columns)
					? index.columns
					: [index.columns];
				indexColumns = cols.map((col) => `"${col}"`);
				indexName = index.name ?? `idx_${tableName}_${cols.join('_')}`;
			}

			const indexQuery = `CREATE INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" (${indexColumns.join(
				', '
			)});`;
			indexQueries.push(indexQuery);
		});
	}

	// Log or execute the index queries
	indexQueries.forEach((query) => {
		console.log(query);
		// await client.query(query);
	});
}
