import type { TsonHandlerModel } from 'from-schema';
import { imageDoc } from '@lyku/json-models';

export const getImage = {
	request: { type: 'bigint' },
	response: imageDoc,
} as const satisfies TsonHandlerModel;
