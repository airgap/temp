import { client as elastic } from '@lyku/elasticsearch-client';

export async function deleteFromElastic(post: {
	id: bigint;
	publish: Date;
}): Promise<void> {
	console.log('Post', post);
	console.log('Post publish', post.publish);
	const publishString = post.publish.toISOString();
	const [year, month] = publishString.split('T')[0].split('-');
	const index = `posts-${year}-${month}`;
	const id = post.id.toString();

	try {
		await elastic.delete({
			index,
			id,
		});
	} catch (error) {
		console.warn(`Failed to delete post in Elasticsearch:`, error);
	}
}
