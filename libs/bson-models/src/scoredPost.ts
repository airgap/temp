import { post } from './post';
import type { PostgresRecordModel } from 'from-schema';
export const scoredPost = {
	description: 'A post containing text, images, or videos',
	properties: {
		...post.properties,
		score: { type: 'double precision' },
	},
	required: [...post.required, 'score'],
} as const satisfies PostgresRecordModel;
