import { type TsonHandlerModel } from 'from-schema';
import { password, username, email } from '@lyku/json-models';

export const registerUser = {
	request: {
		type: 'object',
		properties: {
			email,
			password,
			username,
			agreed: true,
			captcha: {
				type: 'string',
				maxLength: 2000,
			},
		},
		required: ['email', 'password', 'username', 'agreed', 'captcha'],
	},
	authenticated: false,
	throws: [400, 409, 500],
} as const satisfies TsonHandlerModel;
