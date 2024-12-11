import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { sessionId } from '@lyku/json-models';
import { password } from '@lyku/json-models';
const { email } = jsonPrimitives;

export const loginUser = {
  request: {
    type: 'object',
    properties: {
      email,
      password,
    },
    required: ['email', 'password'],
  },
  response: {
    type: 'object',
    properties: {
      sessionId,
    },
    required: ['sessionId'],
  },
} as const satisfies TsonHandlerModel;
