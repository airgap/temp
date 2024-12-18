import { TsonHandlerModel } from 'from-schema';

export const confirmVideoUpload = {
	request: { type: 'bigint' },
	authenticated: true,
} as const satisfies TsonHandlerModel;
