import type { TsonHandlerModel } from 'from-schema';
import { imageDoc } from '@lyku/json-models';

export const getImages = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: imageDoc },
} as const satisfies TsonHandlerModel;
