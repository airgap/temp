import type { PostgresRecordModel } from 'from-schema';

export const hashtagUsage = {
	properties: {
		id: { type: 'bigint', primaryKey: true },
		hashtag: { type: 'bigint' },
		post: { type: 'bigint' },
		group: { type: 'bigint' },
		originalText: { type: 'text' },
		lowerText: { type: 'text' },
		created: { type: 'timestamptz' },
		author: { type: 'bigint' },
	},
	required: [
		'id',
		'hashtag',
		'post',
		'originalText',
		'lowerText',
		'created',
		'author',
	],
} as const satisfies PostgresRecordModel;
