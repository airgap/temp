import { achievementGrant } from 'bson-models';
import { PostgresTableModel } from 'from-schema';

export const achievementGrants = {
	indexes: ['user', 'granted', 'achievement', 'game'],
	schema: achievementGrant,
	// foreignKeys: { user: { users: 'id' } },
} satisfies PostgresTableModel<typeof achievementGrant>;
