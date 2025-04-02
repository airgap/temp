import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listenForPostReplies = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
			tags: {
				type: 'array',
				items: { type: 'bigint' },
			},
			before: { type: 'date' },
		},
		required: ['id'],
	},
	response: {
		type: 'object',
		properties: {
			posts: {
				type: 'array',
				items: post,
			},
			// authors: {
			//     type: 'object',
			//     patternProperties: {
			//         [uuid.pattern]: sanitizedUser
			//     }
			// },
		},
		required: ['posts'],
	},
	stream: true,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
