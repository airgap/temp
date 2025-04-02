import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const getPost = {
	request: post.properties.id,
	response: post,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
