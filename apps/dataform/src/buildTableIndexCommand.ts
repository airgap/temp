import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';

export function buildTableIndexCommands<
	T extends PostgresTableModel<PostgresRecordModel>
>(tableName: string, model: T) {
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

	return indexQueries;
}
