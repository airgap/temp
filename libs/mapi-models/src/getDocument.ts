import type { TsonHandlerModel } from 'from-schema';
import { document } from '@lyku/json-models';

export const getDocument = {
	request: { type: 'bigint' },
	response: document,
} satisfies TsonHandlerModel;
