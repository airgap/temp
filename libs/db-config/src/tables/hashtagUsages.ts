import { PostgresTableModel } from 'from-schema';
import { hashtagUsage } from 'bson-models';
// import { hashtagUsages as docs } from '@lyku/stock-docs';
export const hashtagUsages = {
	indexes: [
		'id',
		'hashtag',
		'lowerText',
		'originalText',
		'author',
		'created',
		'group',
	],
	schema: hashtagUsage,
	// docs: Object.values(docs),
} satisfies PostgresTableModel<typeof hashtagUsage>;
