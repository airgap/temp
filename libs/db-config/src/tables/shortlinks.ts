import { shortlinkRow } from 'bson-models';
import { PostgresTableModel } from 'from-schema';
export const shortlinks = {
	schema: shortlinkRow,
	indexes: ['url', 'author', 'post'],
	primaryKey: ['id'],
} satisfies PostgresTableModel<typeof shortlinkRow>;
