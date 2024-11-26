import { achievementGrant } from 'bson-models';
import { TableModel } from 'from-schema';

export const achievementGrants = {
	indexes: ['user', 'granted'],
	schema: achievementGrant,
} satisfies TableModel<typeof achievementGrant>;
