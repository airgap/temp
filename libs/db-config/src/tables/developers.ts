import { PostgresTableModel } from 'from-schema';
import { developer } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';

export const developers = {
	indexes: ['name', 'homepage', 'updated', 'created'],
	schema: developer,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof developer>;
