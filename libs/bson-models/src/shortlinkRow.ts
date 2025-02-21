import type { PostgresRecordModel } from 'from-schema';

export const shortlinkRow = {
	properties: {
		id: { type: 'bigserial', primaryKey: true },
		url: { type: 'text', maxLength: 255 },
		author: { type: 'bigint' },
		post: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: ['id', 'url', 'created'],
} as const satisfies PostgresRecordModel;
