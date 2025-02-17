import type { PostgresRecordModel } from 'from-schema';
import { username } from './username';

export const hashdoc = {
	properties: {
		email: { type: 'text', maxLength: 50 },
		hash: { type: 'text', maxLength: 50 },
		id: { type: 'bigint', primaryKey: true },
	},
	required: ['email', 'hash', 'id'],
} as const satisfies PostgresRecordModel;
