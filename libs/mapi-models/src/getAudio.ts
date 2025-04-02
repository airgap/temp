import type { TsonHandlerModel } from 'from-schema';
import { audioDoc } from '@lyku/json-models';

export const getAudio = {
	request: { type: 'bigint' },
	response: audioDoc,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
