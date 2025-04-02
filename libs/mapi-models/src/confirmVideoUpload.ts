import type { TsonHandlerModel } from 'from-schema';

export const confirmVideoUpload = {
	request: { type: 'string' },
	authenticated: true,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
