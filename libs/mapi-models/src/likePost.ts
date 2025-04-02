import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const likePost = {
	request: {
		...post.properties.id,
		description: 'Leave a Like on someone post',
	},
	response: post.properties.likes,
	throws: [400, 401, 404, 409, 500],
	authenticated: true,
} as const satisfies TsonHandlerModel;
