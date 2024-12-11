import { sessionId } from './sessionId';
import { userLogin } from './userLogin';
import { DateBsonSchema, PostgresRecordModel } from 'from-schema';
export const session = {
  properties: {
    ...userLogin.properties,
    id: sessionId,
    expiration: { type: 'timestamp' },
  },
  required: [...userLogin.required, 'expiration'],
} as const satisfies PostgresRecordModel;
