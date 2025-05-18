import { TsonHttpHandlerModel } from 'from-schema';

export const listGroupMembershipVectors = {
	response: {
		type: 'array',
		items: {
			type: 'bigint',
		},
	},
	authenticated: true,
	throws: [400, 401, 500],
} as const satisfies TsonHttpHandlerModel;
