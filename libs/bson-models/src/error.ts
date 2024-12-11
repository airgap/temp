import { StringJsonSchema } from 'from-schema';

export const error = {
  type: 'string',
  description: 'The first error encountered, if any',
} as const satisfies StringJsonSchema;
