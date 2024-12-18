import { imageMimeList, videoMimeList } from '@lyku/defaults';
import { EnumColumnModel, FromBsonSchema } from 'from-schema';
export const attachmentMime = {
	type: 'enum',
	enum: [...imageMimeList.values(), ...videoMimeList.values()],
} as const satisfies EnumColumnModel;
export type AttachmentMime = FromBsonSchema<typeof attachmentMime>;
