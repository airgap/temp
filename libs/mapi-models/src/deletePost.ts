import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const deletePost = {
	request: post.properties.id,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
