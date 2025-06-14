import type { TsonHandlerModel } from 'from-schema';
import { fileDoc } from '@lyku/json-models';

export const awaitFile = {
	request: { type: 'bigint' },
	response: fileDoc,
	authenticated: true,
	stream: true,
	throws: [400, 401, 404, 409, 500],
} as const satisfies TsonHandlerModel;
