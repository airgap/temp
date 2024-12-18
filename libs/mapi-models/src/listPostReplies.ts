import { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listPostReplies = {
	request: {
		type: 'object',
		properties: {
			id: post.properties.id,
			tags: {
				type: 'array',
				items: post.properties.id,
			},
			before: post.properties.published,
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
	authenticated: true,
} as const satisfies TsonHandlerModel;
