import { VarcharColumnModel } from 'from-schema';

export const postTitle = {
	description: 'A post containing text, images, or videos',
	type: 'varchar',
	minLength: 1,
	maxLength: 100,
} as const satisfies VarcharColumnModel;
