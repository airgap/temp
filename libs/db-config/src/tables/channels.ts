import { TableModel } from 'from-schema';
import { channel } from 'bson-models';

export const channels = {
	indexes: ['name', 'slug', 'owner', 'totalStreamTime'],
	schema: channel,
} satisfies TableModel<typeof channel>;
