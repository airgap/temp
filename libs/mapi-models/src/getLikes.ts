import type { TsonHandlerModel } from 'from-schema';
import { like } from '@lyku/json-models';

export const getLikes = {
	request: { type: 'array', items: like.properties.id },
	response: { type: 'array', items: like },
	authenticated: false,
} as const satisfies TsonHandlerModel;
