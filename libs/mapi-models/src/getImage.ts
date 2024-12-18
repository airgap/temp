import { imageDoc } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getImage = {
	request: { type: 'bigint' },
	response: imageDoc,
} as const satisfies TsonHandlerModel;
