import type { TsonHandlerModel } from 'from-schema';
import { audioDoc } from '@lyku/json-models';

export const getAudios = {
	request: { type: 'array', items: { type: 'bigint' } },
	response: { type: 'array', items: audioDoc },
} satisfies TsonHandlerModel;
