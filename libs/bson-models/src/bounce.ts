import { EnumBsonSchema, EnumColumnModel, FromBsonSchema } from 'from-schema';

export const bounce = {
  type: 'enum',
  enum: ['neither', 'edge', 'corner'],
} as const satisfies EnumColumnModel;
