import { StringBsonSchema } from 'from-schema';

// Example: qmZ1H5oO7sh9zvhgyJETR1
export const shortcode = {
	bsonType: 'string',
	pattern: '^[a-zA-Z0-9]{,22}$',
} as const satisfies StringBsonSchema;
