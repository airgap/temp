import type { PostgresRecordModel } from 'from-schema';

export const userLogin = {
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		userId: { type: 'bigint' },
		ip: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['id', 'userId', 'ip', 'created'],
} as const satisfies PostgresRecordModel;
