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
} as const satisfies TsonHandlerModel;
