import { videoMimeList } from '@lyku/defaults';
import { EnumBsonSchema } from 'from-schema';

export const videoMime = {
	enum: videoMimeList,
} as const satisfies EnumBsonSchema;
