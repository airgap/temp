import { PostgresTableModel } from 'from-schema';
import { hashtag } from 'bson-models';
// import { hashtags as docs } from '@lyku/stock-docs';
export const hashtags = {
	indexes: ['id', 'lowerText', 'created', 'updated', 'usages'],
	schema: hashtag,
	// docs: Object.values(docs),
} satisfies PostgresTableModel<typeof hashtag>;
