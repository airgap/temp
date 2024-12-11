import { TsonHandlerModel, jsonPrimitives } from 'from-schema';

const { uuidv4 } = jsonPrimitives;

export const confirmVideoUpload = {
  request: uuidv4,
  response: {
    type: 'object',
    properties: {},
    required: [],
  },
  authenticated: true,
} as const satisfies TsonHandlerModel;
