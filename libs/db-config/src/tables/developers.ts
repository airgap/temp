import { PostgresTableModel } from 'from-schema';
import { developer } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const developers = {
	indexes: ['name', 'homepage', 'updated'],
	schema: developer,
	triggers: [
		updateUpdated,
	],
} as const satisfies PostgresTableModel<typeof developer>;
