import reindexScores from './index';

// Run immediately when served
reindexScores()
	.then((result) => {
		console.log('\n🎉 Done!', result);
		process.exit(0);
	})
	.catch((error) => {
		console.error('💥 Fatal error:', error);
		process.exit(1);
	});
