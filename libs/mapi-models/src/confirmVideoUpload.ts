import { TsonHandlerModel } from 'from-schema';

export const confirmVideoUpload = {
	request: { type: 'string' },
	authenticated: true,
} as const satisfies TsonHandlerModel;
