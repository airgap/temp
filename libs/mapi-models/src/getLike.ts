import { HandlerModel } from 'from-schema';
import { like } from '@lyku/json-models';

export const getLike = {
	request: like.properties.id,
	response: like,
	authenticated: false,
} as const satisfies HandlerModel;
