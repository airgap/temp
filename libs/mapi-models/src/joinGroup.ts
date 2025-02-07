import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const joinGroup = {
	request: group.properties.id,
	authenticated: true,
} as const satisfies TsonHandlerModel;
