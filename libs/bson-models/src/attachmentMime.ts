import { imageMimeList, videoMimeList } from '@lyku/defaults';
import type { EnumColumnModel } from 'from-schema';

export const attachmentMime = {
	type: 'enum',
	enum: [...imageMimeList.values(), ...videoMimeList.values()],
} as const satisfies EnumColumnModel;
