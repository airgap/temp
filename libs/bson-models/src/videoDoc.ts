import type { PostgresRecordModel } from 'from-schema';

export const videoDoc = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		duration: { type: 'double precision' },
		width: { type: 'integer' },
		height: { type: 'integer' },
		// meta: {
		// 	type: 'object',
		// 	properties: {}
		// },
		modified: { type: 'timestamptz' },
		size: { type: 'integer' },
		status: { type: 'text' },
		thumbnail: { type: 'text' },
		creator: { type: 'bigint' },
		post: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		updated: { type: 'timestamptz' },
	},
	required: [
		'creator',
		'supertype',
		'width',
		'height',
		'status',
		'creator',
		'id',
		'created',
	],
} as const satisfies PostgresRecordModel;
// console.log('videoDoc', videoDoc);
