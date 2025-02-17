import type { PostgresRecordModel } from 'from-schema';
import { sessionId } from './sessionId';
import { userLogin } from './userLogin';
export const session = {
	properties: {
		...userLogin.properties,
		id: { ...sessionId, primaryKey: true },
		expiration: { type: 'timestamp' },
	},
	required: [...userLogin.required, 'expiration'],
} as const satisfies PostgresRecordModel;
