import { PostgresRecordModel } from 'from-schema';

export const audioDoc = {
	properties: {
		id: { type: 'bigint' },
		url: { type: 'text' },
		title: { type: 'text', maxLength: 50 },
		description: { type: 'text', maxLength: 1000 },
		duration: { type: 'double precision' },
		created: { type: 'date' },
		author: { type: 'bigint' },
	},
	required: [
		'id',
		'url',
		'title',
		'description',
		'duration',
		'created',
		'author',
	],
} as const satisfies PostgresRecordModel;
