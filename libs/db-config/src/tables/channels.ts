import { PostgresTableModel } from 'from-schema';
import { channel } from 'bson-models';
import { updateUpdated } from '../updateUpdated';
export const channels = {
	indexes: [
		'name',
		'slug',
		'owner',
		'totalStreamTime',
		'live',
		'created',
		'totalStreamTime',
	],
	schema: channel,
	triggers: [
		updateUpdated,
	],
} as const satisfies PostgresTableModel<typeof channel>;
