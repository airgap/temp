import { ttfFlowMode } from '@lyku/json-models';
import type { TsonHandlerModel } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';

export const newAiTtfMatch = {
	request: ttfFlowMode,
	response: ttfMatch,
	authenticated: true,
} as const satisfies TsonHandlerModel;
