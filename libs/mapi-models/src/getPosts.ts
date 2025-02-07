import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const getPosts = {
	request: { type: 'array', items: post.properties.id },
	response: { type: 'array', items: post },
	authenticated: false,
} as const satisfies TsonHandlerModel;
