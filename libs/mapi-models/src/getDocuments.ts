import { TsonHandlerModel } from 'from-schema';
import { document } from '@lyku/json-models';

export const getDocuments = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: document },
} as const satisfies TsonHandlerModel;
