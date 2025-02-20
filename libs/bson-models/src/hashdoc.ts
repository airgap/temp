import type { PostgresRecordModel } from 'from-schema';
import { username } from './username';

export const hashdoc = {
	properties: {
		email: { type: 'text', maxLength: 50 },
		hash: { type: 'text', maxLength: 64 },
		id: { type: 'bigint', primaryKey: true },
		username: { ...username, unique: true },
	},
	required: ['email', 'hash', 'id', 'username'],
} as const satisfies PostgresRecordModel;
