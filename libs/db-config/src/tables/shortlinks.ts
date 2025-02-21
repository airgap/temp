import { shortlinkRow } from 'bson-models';
import { PostgresTableModel } from 'from-schema';
import { updateUpdated } from '../updateUpdated';
export const shortlinks = {
	schema: shortlinkRow,
	indexes: ['url', 'author', 'post'],
	primaryKey: ['id'],
	triggers: [updateUpdated],
} satisfies PostgresTableModel<typeof shortlinkRow>;
