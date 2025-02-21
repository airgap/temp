import { PostgresTriggerModel } from 'from-schema';
import updatedTrigger from './updated.sql';
export const updateUpdated = {
	before: 'update',
	sql: updatedTrigger,
} satisfies PostgresTriggerModel;
