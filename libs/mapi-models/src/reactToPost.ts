import type { TsonHandlerModel } from 'from-schema';
import { reactions } from '@lyku/helpers';

export const reactToPost = {
	request: {
		type: 'object',
		properties: {
			postId: {
				type: 'bigint',
				description: 'The ID of the post to react to',
			},
			type: {
				enum: reactions,
			},
		},
		required: ['postId', 'type'],
		description: 'React to a post',
	},
	throws: [400, 401, 404, 409, 500],
	authenticated: true,
} as const satisfies TsonHandlerModel;
