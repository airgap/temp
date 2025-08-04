import { achievementGrant } from '@lyku/bson-models';
import { PostgresTableModel } from 'from-schema';

export const achievementGrants = {
	indexes: ['user', 'granted', 'achievement', 'game'],
	schema: achievementGrant,
	primaryKey: ['achievement', 'user'],
	// foreignKeys: { user: { users: 'id' } },
} satisfies PostgresTableModel<typeof achievementGrant>;
