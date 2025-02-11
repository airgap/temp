import type { EnumColumnModel } from 'from-schema';
import { imageMimeList } from '@lyku/defaults';

export const imageMime = {
	type: 'enum',
	enum: imageMimeList,
} as const satisfies EnumColumnModel;
