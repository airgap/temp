import { group } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';
export const leaveGroup = {
	request: group.properties.id,
	authenticated: true,
} as const satisfies HandlerModel;
