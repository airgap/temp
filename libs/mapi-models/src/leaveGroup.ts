import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const leaveGroup = {
	request: group.properties.id,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
