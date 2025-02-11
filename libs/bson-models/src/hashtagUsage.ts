import type { PostgresRecordModel } from 'from-schema';

export const hashtagUsage = {
	properties: {
		id: { type: 'bigint' },
		hashtag: { type: 'bigint' },
		post: { type: 'bigint' },
		group: { type: 'bigint' },
		originalText: { type: 'text' },
		lowerText: { type: 'text' },
		created: { type: 'timestamp' },
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
