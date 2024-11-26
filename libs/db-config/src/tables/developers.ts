import { TableModel } from 'from-schema';
import { developer } from 'bson-models';

export const developers = {
	indexes: ['name'],
	schema: developer,
} as const satisfies TableModel<typeof developer>;
