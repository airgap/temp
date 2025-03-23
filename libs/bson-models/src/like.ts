import { user } from './user';
import { post } from './post';
import { idBond } from './idBond';
import type { PostgresRecordModel } from 'from-schema';

export const like = {
	properties: {
		userId: { type: 'bigint', primaryKey: true },
		postId: { type: 'bigint', primaryKey: true },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['userId', 'postId', 'created'],
} as const satisfies PostgresRecordModel;
