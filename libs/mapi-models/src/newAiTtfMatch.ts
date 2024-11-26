import { ttfFlowMode } from '@lyku/json-models';
import { HandlerModel } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';

export const newAiTtfMatch = {
	request: ttfFlowMode,
	response: ttfMatch,
	authenticated: false,
} as const satisfies HandlerModel;
