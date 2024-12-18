import { PostgresRecordModel } from 'from-schema';

export const shortlinkRow = {
	properties: {
		url: { type: 'character', length: 255 },
		authorId: { type: 'bigint' },
		postId: { type: 'bigint' },
	},
	required: ['url'],
} as const satisfies PostgresRecordModel;
