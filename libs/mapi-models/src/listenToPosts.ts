import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listenToPosts = {
	request: { type: 'array', items: post.properties.id },
	response: post,
	stream: { tweakRequest: { type: 'array', items: post.properties.id } },
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
