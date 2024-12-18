// import { FromObjectBsonSchema } from 'from-schema';
// import { dbConfig } from '@lyku/db-config';
// import { Database } from '@lyku/db-config/kysely';

// export const dbName = 'Lyku';

// type MyDbConfig = typeof dbConfig;
// export const collectionNames = Object.keys(
// 	dbConfig.tables
// ) as (keyof typeof dbConfig.tables)[];

// export type ActualCollections = {
// 	[TableName in keyof MyDbConfig['tables']]: Collection<
// 		FromObjectBsonSchema<MyDbConfig['tables'][TableName]['schema']>
// 	>;
// };

// // Query to check which collections don't exist
// const getMissingCollections = async (db: Db): Promise<string[]> => {
// 	const existingCollections = await db.listCollections().toArray();
// 	const existingNames = existingCollections.map((col) => col.name);
// 	return collectionNames.filter((name) => !existingNames.includes(name));
// };

// export const reifyCollections = async (db: Db) => {
// 	// Create missing collections
// 	const missingCollections = await getMissingCollections(db);
// 	for (const collectionName of missingCollections) {
// 		await db.createCollection(collectionName);
// 		console.log(`Created collection ${collectionName}`);
// 	}

// 	// Create collections object
// 	const collections = collectionNames.reduce(
// 		(obj, name) => ({
// 			...obj,
// 			[name]: db.collection(name),
// 		}),
// 		{}
// 	) as ActualCollections;

// 	// Setup indexes and initial documents
// 	const indexesCreated = await reifyIndexes(dbConfig, collections);
// 	const filtered = indexesCreated.filter((v) => v);
// 	if (filtered.length) console.log('Created indexes', filtered);

// 	console.log('Reifying internal documents');
// 	await reifyInternalDocuments(dbConfig, collections);
// 	console.log('Reified internal documents');

// 	return collections;
// };

// const reifyIndexes = async (
// 	{ tables: config }: MyDbConfig,
// 	collections: ActualCollections
// ) => {
// 	const collectionIndexPairs = Object.entries(config)
// 		.filter(
// 			([, collection]) => 'indexes' in collection && collection.indexes.length
// 		)
// 		.flatMap(([collectionName, c]) =>
// 			'indexes' in c
// 				? c.indexes.map((index) => ({ collection: collectionName, index }))
// 				: []
// 		);

// 	return Promise.all(
// 		collectionIndexPairs.map(async ({ collection, index }) => {
// 			const col = collections[collection as keyof typeof collections];
// 			const existingIndexes = await col.indexInformation();

// 			if (typeof index === 'string') {
// 				// Single field index
// 				if (!existingIndexes[index + '_1']) {
// 					await col.createIndex({ [index]: 1 });
// 					return index;
// 				}
// 			} else {
// 				// Compound index
// 				// return mapCompoundIndex(col, index, existingIndexes);
// 			}
// 			return null;
// 		})
// 	);
// };

// const reifyInternalDocuments = async (
// 	{ tables: config }: MyDbConfig,
// 	collections: ActualCollections
// ) => {
// 	return Promise.allSettled(
// 		Object.entries(config)
// 			.filter(
// 				([, collection]) => 'docs' in collection && collection.docs.length
// 			)
// 			.map(([collectionName, c]) =>
// 				'docs' in c
// 					? collections[collectionName].bulkWrite(
// 							c.docs.map((doc) => ({
// 								updateOne: {
// 									filter: { _id: doc._id },
// 									update: { $set: doc },
// 									upsert: true,
// 								},
// 							}))
// 					  )
// 					: []
// 			)
// 	);
// };

// const mapCompoundIndex = async (
// 	collection: Collection,
// 	index: Record<string, string[]>,
// 	existingIndexes: Record<string, any>
// ) => {
// 	const indexName = Object.keys(index)[0];
// 	const fields = index[indexName];

// 	// Check if compound index already exists
// 	const indexKey = fields.join('_1_') + '_1';
// 	if (!existingIndexes[indexKey]) {
// 		const indexSpec = fields.reduce(
// 			(obj, field) => ({
// 				...obj,
// 				[field]: 1,
// 			}),
// 			{}
// 		);

// 		await collection.createIndex(indexSpec, { name: indexName });
// 		return index;
// 	}
// 	return null;
// };

// // Usage example:
// export async function setupDatabase() {
// 	const client = new MongoClient('mongodb://localhost:27017');
// 	await client.connect();

// 	const db = client.db(dbName);
// 	const collections = await reifyCollections(db);

// 	return { client, db, collections };
// }
