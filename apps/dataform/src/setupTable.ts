import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';
import { buildTableCreationCommand } from './createTable';
import { buildTableIndexCommands } from './buildTableIndexCommand';
import { buildTableTriggerCommands } from './buildTableTriggerCommands';

export function setupTable<T extends PostgresTableModel<PostgresRecordModel>>(
	tableName: string,
	model: T,
) {
	let output = '';
	const append = (str?: string) => (output += (str ?? '') + '\n');
	const length = Math.max(tableName.length + 6, 30);
	const width = length - (tableName.length % 2);
	const sep = '-'.repeat(width);
	const pad = '-'.repeat((width - tableName.length - 3) / 2);
	append(sep);
	append(`${pad}  ${tableName}  ${pad}`);
	append(sep);
	append();
	append('---- Create table');
	const tableCreator = buildTableCreationCommand(tableName, model);
	append(tableCreator);
	// await client.query(createTableQuery); // Execute the create table query
	append();
	append('---- Create indexes');
	// Generate index creation commands
	const indexQueries = buildTableIndexCommands(tableName, model);

	// Log or execute the index queries
	indexQueries.forEach((query) => {
		append(query);
		// await client.query(query);
	});
	const triggerQueries = buildTableTriggerCommands(tableName, model);
	if (triggerQueries.length > 0) {
		append();
		append('---- Create triggers');
		triggerQueries.forEach((query) => {
			append(query);
			// await client.query(query);
		});
	}
	append();
	append();
	return output;
}
