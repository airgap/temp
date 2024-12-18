import { document } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getDocument = {
	request: { type: 'bigint' },
	response: document,
} satisfies TsonHandlerModel;
