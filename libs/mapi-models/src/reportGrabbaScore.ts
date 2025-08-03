import type { TsonHandlerModel } from 'from-schema';
import { grabbaScore } from '@lyku/json-models';

export const reportGrabbaScore = {
	request: grabbaScore,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
