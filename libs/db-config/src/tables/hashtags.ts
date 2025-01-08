import { PostgresTableModel } from 'from-schema';
import { hashtag } from 'bson-models';
// import { hashtags as docs } from '@lyku/stock-docs';
export const hashtags = {
	indexes: ['id', 'lowerText'],
	schema: hashtag,
	// docs: Object.values(docs),
} satisfies PostgresTableModel<typeof hashtag>;
