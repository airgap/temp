import type { TsonHandlerModel } from 'from-schema';
import { audioDoc } from '@lyku/json-models';

export const getAudio = {
	request: { type: 'bigint' },
	response: audioDoc,
} as const satisfies TsonHandlerModel;
