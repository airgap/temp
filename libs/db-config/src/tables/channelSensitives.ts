import { PostgresTableModel } from 'from-schema';
import { channelSensitives as channelSensitivesBundle } from 'bson-models';

export const channelSensitives = {
	schema: channelSensitivesBundle,
} satisfies PostgresTableModel<typeof channelSensitivesBundle>;
