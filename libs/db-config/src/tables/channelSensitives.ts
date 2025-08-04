import { PostgresTableModel } from 'from-schema';
import { channelSensitives as channelSensitivesBundle } from '@lyku/bson-models';
import { updateUpdated } from '../updateUpdated';
export const channelSensitives = {
	schema: channelSensitivesBundle,
	indexes: ['owner', 'created', 'updated'],
	triggers: [updateUpdated],
} satisfies PostgresTableModel<typeof channelSensitivesBundle>;
