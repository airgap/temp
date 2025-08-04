import { PostgresTableModel } from 'from-schema';
import { reaction } from '@lyku/bson-models';
export const reactions = {
	indexes: ['userId', 'postId'],
	schema: reaction,
	unique: ['userId', 'postId'],
} as const satisfies PostgresTableModel<typeof reaction>;
