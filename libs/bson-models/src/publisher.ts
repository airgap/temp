import type { PostgresRecordModel } from 'from-schema';

export const publisher = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		homepage: { type: 'text', minLength: 1, maxLength: 50 },
		name: { type: 'text', minLength: 1, maxLength: 50 },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['id', 'name', 'homepage', 'created'],
} as const satisfies PostgresRecordModel;
