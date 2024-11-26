import { HandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';
import { like } from '@lyku/json-models';

export const listenToLikes = {
	request: { type: 'array', items: post.properties.id },
	response: like,
	stream: true,
	authenticated: true,
} as const satisfies HandlerModel;
