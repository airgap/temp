import { PostgresTableModel } from 'from-schema';
import { developer } from 'bson-models';

export const developers = {
	indexes: ['name', 'homepage'],
	schema: developer,
} as const satisfies PostgresTableModel<typeof developer>;
