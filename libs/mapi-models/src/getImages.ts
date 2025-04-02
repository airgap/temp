import type { TsonHandlerModel } from 'from-schema';
import { imageDoc } from '@lyku/json-models';

export const getImages = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: imageDoc },
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
