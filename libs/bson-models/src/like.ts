import { user } from './user';
import { post } from './post';
import { idBond } from './idBond';
import type { PostgresRecordModel } from 'from-schema';

export const like = {
	properties: {
		id: { ...idBond, primaryKey: true },
		userId: { type: 'bigint' },
		postId: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['id', 'userId', 'postId', 'created'],
} as const satisfies PostgresRecordModel;
