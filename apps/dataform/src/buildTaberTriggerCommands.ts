import { PostgresRecordModel, PostgresTableModel } from 'from-schema';
import { mapColumnType } from './mapColumnType';

export function buildTableTriggerCommands<
	T extends PostgresTableModel<PostgresRecordModel>
>(tableName: string, model: T) {
	const triggerQueries: string[] = [];
	if (model.triggers) {
		model.triggers.forEach((trigger, i) => {
			const triggerName = trigger.name ?? `${tableName}_trigger_${i + 1}`;
			const timing = 'before' in trigger ? 'BEFORE' : 'AFTER';
			const event = 'before' in trigger ? trigger.before : trigger.after;
			
			triggerQueries.push(
				`CREATE OR REPLACE FUNCTION ${triggerName}_fn()\n` +
				`RETURNS TRIGGER AS $$\n` +
				`BEGIN\n` +
				`${trigger.sql}\n` +
				`END;\n` +
				`$$ LANGUAGE plpgsql;\n`,
				
				`DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};\n` +
				`CREATE TRIGGER ${triggerName}\n` +
				`${timing} ${event.toUpperCase()}\n` +
				`ON ${tableName}\n` +
				`FOR EACH ROW\n` +
				`EXECUTE FUNCTION ${triggerName}_fn();`
			);
		});
	}

	return triggerQueries;
}
