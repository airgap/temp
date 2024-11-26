import { inventoryItem } from './inventoryItem';
import { FromBsonSchema, MapBsonSchema } from 'from-schema';
import { equipmentSlot } from './equipmentSlot';

// export const equipmentMap = {
// 	bsonType: 'map',
// 	keys: equipmentSlot,
// 	values: inventoryItem.properties.id,
// 	partial: true,
// } satisfies MapBsonSchema;

// export type EquipmentMap = FromBsonSchema<typeof equipmentMap>;
