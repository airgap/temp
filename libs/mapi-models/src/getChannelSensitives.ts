import type { TsonHandlerModel } from 'from-schema';
import { channelSensitives, channel } from '@lyku/json-models';

export const getChannelSensitives = {
	request: channel.properties.id,
	response: channelSensitives,
	authenticated: true,
} as const satisfies TsonHandlerModel;
