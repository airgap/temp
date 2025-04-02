import { ttfMatch } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const listenForTtfPlays = {
	request: ttfMatch.properties.id,
	response: ttfMatch,
	stream: true,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
