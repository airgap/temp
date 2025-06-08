import type { PostgresRecordModel } from 'from-schema';

export const document = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		url: { type: 'text' },
		title: { type: 'text', maxLength: 50 },
		description: { type: 'text', maxLength: 1000 },
		type: { type: 'text', maxLength: 50 },
		size: { type: 'bigint' },
		length: { type: 'bigint' },
		created: { type: 'timestamptz', default: { sql: 'CURRENT_TIMESTAMP' } },
		author: { type: 'bigint' },
	},
	required: [
		'id',
		'url',
		'title',
		'description',
		'type',
		'size',
		'length',
		'created',
		'author',
	],
} as const satisfies PostgresRecordModel;
