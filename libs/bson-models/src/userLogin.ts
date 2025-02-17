import type { PostgresRecordModel } from 'from-schema';

export const userLogin = {
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		userId: { type: 'bigint' },
		ip: { type: 'text' },
		created: { type: 'timestamp' },
	},
	required: ['id', 'userId', 'ip', 'created'],
} as const satisfies PostgresRecordModel;
