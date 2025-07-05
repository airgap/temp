import type { PostgresRecordModel } from 'from-schema';

export const developer = {
	properties: {
		id: { type: 'integer', primaryKey: true },
		homepage: { type: 'text' },
		name: { type: 'text', maxLength: 100 },
		thumbnail: { type: 'text' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: {
			type: 'timestamptz',
			generated: { always: true, as: 'CURRENT_TIMESTAMP' },
		},
	},
	required: ['id', 'name', 'homepage', 'created'],
} as const satisfies PostgresRecordModel;
