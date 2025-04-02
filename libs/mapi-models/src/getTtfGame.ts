import type { TsonHandlerModel } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';
export const getTtfGame = {
	request: ttfMatch.properties.id,
	response: ttfMatch,
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
