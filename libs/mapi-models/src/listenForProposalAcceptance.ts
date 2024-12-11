import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
import { ttfMatch } from '@lyku/json-models';
const { uid } = jsonPrimitives;

export const listenForProposalAcceptance = {
  request: {
    type: 'object',
    properties: {
      id: uid,
    },
    required: ['id'],
  },
  response: ttfMatch,
  stream: true,
  authenticated: false,
} as const satisfies TsonHandlerModel;
