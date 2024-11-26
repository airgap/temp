import { ArrayBsonSchema } from 'from-schema';
import { inventoryItem } from './inventoryItem';



export const inventory = {
	bsonType: 'array',
	minItems: 0,
	maxItems: 30,
	items: inventoryItem,
} satisfies ArrayBsonSchema;
