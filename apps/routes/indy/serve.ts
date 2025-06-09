import { reindexPosts } from './reindex-elastic';

reindexPosts()
	.then(() => {
		console.log('Reindex completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Fatal error during reindex:', error);
		process.exit(1);
	});
