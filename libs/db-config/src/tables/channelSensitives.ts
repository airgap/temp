import { TableModel } from 'from-schema';
import { channelSensitives as channelSensitivesBundle } from 'bson-models';

export const channelSensitives = {
	schema: channelSensitivesBundle,
} satisfies TableModel<typeof channelSensitivesBundle>;
