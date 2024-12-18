import { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';
import { likeState } from '@lyku/json-models';

export const listenToMyLikes = {
	request: { type: 'array', items: post.properties.id },
	response: likeState,
	authenticated: true,
	stream: true,
} as const satisfies TsonHandlerModel;
