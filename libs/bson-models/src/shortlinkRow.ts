import type { PostgresRecordModel } from 'from-schema';

export const shortlinkRow = {
	properties: {
		id: { type: 'bigserial' },
		url: { type: 'character', length: 255 },
		author: { type: 'bigint' },
		post: { type: 'bigint' },
	},
	required: ['id', 'url'],
} as const satisfies PostgresRecordModel;
