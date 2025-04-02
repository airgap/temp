import type { TsonHandlerModel } from 'from-schema';
import { imageDoc } from '@lyku/json-models';

export const getImage = {
	request: { type: 'bigint' },
	response: imageDoc,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
