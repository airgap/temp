import { imageDoc } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getImages = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: imageDoc },
} as const satisfies TsonHandlerModel;
