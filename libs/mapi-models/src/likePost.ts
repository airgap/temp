import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const reactToPost = {
	request: {
		type: 'object',
		properties: {
			postId: {
				type: 'bigint',
				description: 'The ID of the post to react to',
			},
			type: {
				type: 'string',
				pattern: '^[👍👎👏👋👌💖♥️🧡💙💜💛💚🤍🖤🤎💔]$',
				description: 'The type of reaction to leave',
			},
		},
		required: ['postId', 'type'],
		description: 'React to a post',
	},
	throws: [400, 401, 404, 409, 500],
	authenticated: true,
} as const satisfies TsonHandlerModel;
