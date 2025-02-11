import type { VarcharColumnModel } from 'from-schema';

// Example: qmZ1H5oO7sh9zvhgyJETR1
export const shortcode = {
	type: 'varchar',
	maxLength: 22,
	pattern: '^[a-zA-Z0-9]{,22}$',
} as const satisfies VarcharColumnModel;
