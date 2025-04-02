import type { TsonHandlerModel } from 'from-schema';
import { channelSensitives, channel } from '@lyku/json-models';

export const getChannelSensitives = {
	request: channel.properties.id,
	response: channelSensitives,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
