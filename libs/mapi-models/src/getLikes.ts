import type { TsonHandlerModel } from 'from-schema';
import { like, post } from '@lyku/json-models';

export const getLikes = {
	request: { type: 'array', items: post.properties.id },
	response: { type: 'array', items: like },
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
