import type { PostgresRecordModel } from 'from-schema';
import { username } from './username';

export const hashdoc = {
	properties: {
		email: { type: 'text', maxLength: 50 },
		hash: { type: 'text', maxLength: 64 },
		id: { type: 'bigint', primaryKey: true },
		username: { ...username, unique: true },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['email', 'hash', 'id', 'username', 'created'],
} as const satisfies PostgresRecordModel;
