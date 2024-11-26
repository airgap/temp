import { HandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const getPost = {
	request: post.properties.id,
	response: post,
	authenticated: false,
} as const satisfies HandlerModel;
