import type { TsonHandlerModel } from 'from-schema';
import { group } from '@lyku/json-models';

export const leaveGroup = {
	request: group.properties.id,
	authenticated: true,
} as const satisfies TsonHandlerModel;
