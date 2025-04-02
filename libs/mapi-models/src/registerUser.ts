import { type TsonHandlerModel } from 'from-schema';
import { password, username, session, email } from '@lyku/json-models';
export const registerUser = {
	request: {
		type: 'object',
		properties: {
			email,
			password,
			username,
			agreed: true,
		},
		required: ['email', 'password', 'username', 'agreed'],
	},
	authenticated: false,
	throws: [400, 409, 500],
} as const satisfies TsonHandlerModel;
