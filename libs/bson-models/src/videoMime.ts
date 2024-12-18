import { videoMimeList } from '@lyku/defaults';
import { EnumBsonSchema, EnumColumnModel } from 'from-schema';

export const videoMime = {
	type: 'enum',
	enum: videoMimeList,
} as const satisfies EnumColumnModel;
