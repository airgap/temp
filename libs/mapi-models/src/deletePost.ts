import { HandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const deletePost = {
	request: post.properties.id,
	authenticated: true,
} as const satisfies HandlerModel;
