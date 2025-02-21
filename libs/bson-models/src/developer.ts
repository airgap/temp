import type { PostgresRecordModel } from 'from-schema';

export const developer = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		homepage: { type: 'text' },
		name: { type: 'text', maxLength: 100 },
		thumbnail: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['id', 'name', 'homepage', 'created'],
} as const satisfies PostgresRecordModel;
