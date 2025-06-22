import type { PostgresRecordModel } from 'from-schema';

export const fileDoc = {
	properties: {
		id: { type: 'bigint' },
		duration: { type: 'double precision' },
		hostId: { type: 'text', maxLength: 100 },
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
		type: { type: 'text', maxLength: 100 },
		host: { type: 'text', maxLength: 100 },
		reason: { type: 'text', maxLength: 25 },
	},
	required: [
		'creator',
		'hostId',
		'supertype',
		'width',
		'height',
		'status',
		'creator',
		'id',
		'created',
		'type',
		'host',
	],
} as const satisfies PostgresRecordModel;
// console.log('videoDoc', videoDoc);
