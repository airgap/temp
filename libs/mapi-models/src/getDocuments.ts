import type { TsonHandlerModel } from 'from-schema';
import { document } from '@lyku/json-models';

export const getDocuments = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: document },
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
