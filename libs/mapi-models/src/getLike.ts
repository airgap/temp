import type { TsonHandlerModel } from 'from-schema';
import { like, post } from '@lyku/json-models';

export const getLike = {
	request: post.properties.id,
	response: like,
	authenticated: false,
} as const satisfies TsonHandlerModel;
