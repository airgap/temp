import { PostgresTableModel } from 'from-schema';
import { channelSensitives as channelSensitivesBundle } from 'bson-models';

export const channelSensitives = {
	schema: channelSensitivesBundle,
	indexes: ['owner', 'created', 'updated'],
} satisfies PostgresTableModel<typeof channelSensitivesBundle>;
