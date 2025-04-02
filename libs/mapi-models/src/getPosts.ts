import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const getPosts = {
	request: { type: 'array', items: post.properties.id },
	response: { type: 'array', items: post },
	authenticated: false,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
