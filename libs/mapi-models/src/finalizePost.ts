import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const finalizePost = {
	request: {
		type: 'object',
		properties: {
			id: { type: 'bigint' },
			body: { type: 'string', maxLength: post.properties.body.maxLength },
		},
		required: ['id'],
	},
	response: post,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
