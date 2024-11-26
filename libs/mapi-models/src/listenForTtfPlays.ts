import { ttfMatch } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';

export const listenForTtfPlays = {
	request: ttfMatch.properties.id,
	response: ttfMatch,
	stream: true,
	authenticated: false,
} as const satisfies HandlerModel;
