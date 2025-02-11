import type { EnumColumnModel } from 'from-schema';
import { videoMimeList } from '@lyku/defaults';

export const videoMime = {
	type: 'enum',
	enum: videoMimeList,
} as const satisfies EnumColumnModel;
