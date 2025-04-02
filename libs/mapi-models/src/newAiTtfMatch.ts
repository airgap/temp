import { ttfFlowMode, ttfMatch } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';

export const newAiTtfMatch = {
	request: ttfFlowMode,
	response: ttfMatch,
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHandlerModel;
