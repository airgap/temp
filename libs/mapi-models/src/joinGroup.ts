import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const joinGroup = {
	request: group.properties.id,
	authenticated: true,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
