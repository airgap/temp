import { HandlerModel, jsonPrimitives } from 'from-schema';
import { post } from '@lyku/json-models';

const { uid, number } = jsonPrimitives;

export const listenForPostReplies = {
	request: {
		type: 'object',
		properties: {
			id: uid,
			tags: {
				type: 'array',
				items: uid,
			},
			before: number,
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
} as const satisfies HandlerModel;
