import { imageMimeList, videoMimeList } from '@lyku/defaults';
import { EnumBsonSchema, FromBsonSchema } from 'from-schema';
export const attachmentMime = {
  enum: [...imageMimeList.values(), ...videoMimeList.values()],
} as const satisfies EnumBsonSchema;
export type AttachmentMime = FromBsonSchema<typeof attachmentMime>;
