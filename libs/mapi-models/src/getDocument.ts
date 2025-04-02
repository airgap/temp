import type { TsonHandlerModel } from 'from-schema';
import { document } from '@lyku/json-models';

export const getDocument = {
	request: { type: 'bigint' },
	response: document,
	authenticated: false,
	throws: [400, 401, 404, 500],
} satisfies TsonHandlerModel;
