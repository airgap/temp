import type { TsonHandlerModel } from 'from-schema';
import { post } from '@lyku/json-models';

export const listenToPoints = {
	response: { type: 'bigint' },
	stream: true,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
