import { imageMimeList } from '@lyku/defaults';
import { EnumColumnModel } from 'from-schema';

export const imageMime = {
	type: 'enum',
	enum: imageMimeList,
} as const satisfies EnumColumnModel;
