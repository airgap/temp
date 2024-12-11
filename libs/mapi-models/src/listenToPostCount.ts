import { TsonHandlerModel, jsonPrimitives } from 'from-schema';
const { number } = jsonPrimitives;

export const listenToPostCount = {
  response: number,
  stream: true,
  authenticated: false,
} as const satisfies TsonHandlerModel;
