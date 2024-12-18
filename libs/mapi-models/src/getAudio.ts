import { audioDoc } from '@lyku/json-models';
import { TsonHandlerModel } from 'from-schema';

export const getAudio = {
	request: { type: 'bigint' },
	response: audioDoc,
} as const satisfies TsonHandlerModel;
