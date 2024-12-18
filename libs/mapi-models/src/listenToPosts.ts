import { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listenToPosts = {
	request: { type: 'array', items: post.properties.id },
	response: post,
	stream: true,
	authenticated: false,
} as const satisfies TsonHandlerModel;
