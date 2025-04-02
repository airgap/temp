import type { TsonHandlerModel } from 'from-schema';

export const listenToPostCount = {
	response: { type: 'bigint' },
	stream: true,
	authenticated: false,
	throws: [400, 401, 404, 500],
} as const satisfies TsonHandlerModel;
