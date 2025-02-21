import type { PostgresRecordModel } from 'from-schema';

export const imageDoc = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		// metadata: {
		// 	type: 'object',
		// 	properties: {},
		// },
		uploaded: { type: 'text' },
		requireSignedURLs: { type: 'boolean' },
		variants: {
			type: 'array',
			items: { type: 'text' },
		},
		draft: { type: 'boolean' },
		channel: { type: 'text' },
		uploader: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
	},
	required: ['id', 'uploaded', 'requireSignedURLs', 'variants', 'created'],
} as const satisfies PostgresRecordModel;
