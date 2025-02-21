import { PostgresTableModel } from 'from-schema';
import { userFollow } from 'bson-models';
import { updateUpdated } from '../updateUpdated';

export const userFollows = {
	indexes: ['follower', 'followee', ['follower', 'followee']],
	schema: userFollow,
	triggers: [updateUpdated],
} as const satisfies PostgresTableModel<typeof userFollow>;
