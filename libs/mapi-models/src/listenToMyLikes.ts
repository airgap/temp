import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';
import { likeState } from '@lyku/json-models';

export const listenToMyLikes = {
	request: { type: 'array', items: post.properties.id },
	response: post.properties.id,
	authenticated: true,
	stream: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
