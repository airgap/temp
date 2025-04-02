import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const getMyLikes = {
	request: { type: 'array', items: post.properties.id },
	response: { type: 'array', items: { type: 'bigint' } },
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
