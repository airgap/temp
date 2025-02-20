import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';
import { buildTableCreationCommand } from './createTable';
import { buildTableIndexCommands } from './buildTableIndexCommand';
import { buildTableTriggerCommands } from './buildTaberTriggerCommands';

export async function setupTable<
	T extends PostgresTableModel<PostgresRecordModel>
>(tableName: string, model: T) {
	const tableCreator = buildTableCreationCommand(tableName, model);
	console.log(tableCreator);
	// await client.query(createTableQuery); // Execute the create table query

	// Generate index creation commands
	const indexQueries = buildTableIndexCommands(tableName, model);

	// Log or execute the index queries
	indexQueries.forEach((query) => {
		console.log(query);
		// await client.query(query);
	});

	const triggerQueries = buildTableTriggerCommands(tableName, model);
	triggerQueries.forEach((query) => {
		console.log(query);
		// await client.query(query);
	});
}
