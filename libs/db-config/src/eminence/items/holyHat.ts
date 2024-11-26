import { InventoryItem } from '@lyku/json-models';

export const holyHat = {
	id: 'a2c79c0d-084f-4f37-af7a-a2ba9c291001',
	name: 'Holy Hat',
	placeable: true,
	slots: ['head'],
} as const satisfies InventoryItem;
