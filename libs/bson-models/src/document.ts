import { PostgresRecordModel } from 'from-schema';

export const document = {
	properties: {
		id: { type: 'bigint' },
		url: { type: 'text' },
		title: { type: 'text', maxLength: 50 },
		description: { type: 'text', maxLength: 1000 },
		mimeType: { type: 'text', maxLength: 50 },
		size: { type: 'bigint' },
		length: { type: 'bigint' },
		created: { type: 'date' },
		author: { type: 'bigint' },
	},
	required: [
		'id',
		'url',
		'title',
		'description',
		'mimeType',
		'size',
		'length',
		'created',
		'author',
	],
} as const satisfies PostgresRecordModel;