import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { password } from '@lyku/json-models';
import { username } from '@lyku/json-models';
import { session } from '@lyku/json-models';
const { email } = jsonPrimitives;
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

	response: session.properties.id,
	authenticated: false,
} as const satisfies TsonHandlerModel;
