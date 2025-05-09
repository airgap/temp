import { PostgresTableModel } from 'from-schema';
import { reaction } from 'bson-models';
export const reactions = {
	indexes: ['userId', 'postId'],
	schema: reaction,
} as const satisfies PostgresTableModel<typeof reaction>;
