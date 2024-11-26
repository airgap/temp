import { HandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const likePost = {
	request: {
		...post.properties.id,
		description: 'Leave a Like on someone post',
	},
	response: post.properties.likes,
	authenticated: true,
} as const satisfies HandlerModel;
