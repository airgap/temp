import type { PostgresRecordModel } from 'from-schema';

export const imageDoc = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		// metadata: {
		// 	type: 'object',
		// 	properties: {},
		// },
		requireSignedURLs: { type: 'boolean', default: false },
		variants: {
			type: 'array',
			items: { type: 'text' },
		},
		channel: { type: 'text' },
		uploader: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['id', 'uploaded', 'requireSignedURLs', 'created'],
} as const satisfies PostgresRecordModel;
