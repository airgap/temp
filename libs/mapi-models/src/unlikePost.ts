import type { TsonHandlerModel, BigIntTsonSchema } from 'from-schema';
import { post } from '@lyku/json-models';

const request = {
	...post.properties.id,
	description: 'Remove a Like from someones post',
} as const satisfies BigIntTsonSchema;

export const unlikePost = {
	request,
	response: post.properties.likes,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
