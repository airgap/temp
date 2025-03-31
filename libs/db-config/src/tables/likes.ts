import { PostgresTableModel } from 'from-schema';
import { like } from 'bson-models';

export const likes = {
	indexes: ['userId', 'postId', ['userId', 'postId'], 'created'],
	schema: like,
	primaryKey: ['userId', 'postId'],
} as const satisfies PostgresTableModel<typeof like>;
