import { handleLikePost } from '@lyku/handles';
import { bigintToBase58, Err } from '@lyku/helpers';

import { sql } from 'kysely';
import { grantPointsToUser, sendNotification } from '@lyku/route-helpers';
export default handleLikePost(async (postId, { requester, db, elastic }) => {
	// Check if post exists and isn't already liked by this user
	const existingLike = await db
		.selectFrom('likes')
		.where('userId', '=', requester)
		.where('postId', '=', postId)
		.executeTakeFirst();

	if (existingLike) throw new Err(409, 'Post already liked');

	const post = await db
		.selectFrom('posts')
		.selectAll()
		.where('id', '=', postId)
		.executeTakeFirst();

	if (!post) throw new Err(404, "Post doesn't exist");

	if (post.author === requester) {
		throw new Err(403, 'You cannot like your own post');
	}

	// Insert the like
	await db
		.insertInto('likes')
		.values({
			userId: requester,
			postId: postId,
			created: new Date(),
		})
		.execute();

	// Increment post like count
	const updatedPost = await db
		.updateTable('posts')
		.set({
			likes: sql`likes + 1`,
		})
		.where('id', '=', postId)
		.returning('likes')
		.executeTakeFirstOrThrow();

	// Add point to recipient
	if (post.author !== requester) await grantPointsToUser(1, post.author, db);
	console.log('Updating post likes in elastic');
	const [year, month] = post.publish.toISOString().split('T')[0].split('-');
	const index = `posts-${year}-${month}`;
	await elastic.update({
		index,
		id: postId.toString(),
		script: {
			source: 'ctx._source.likes = (ctx._source.likes ?: 0) + 1',
			lang: 'painless',
		},
	});
	console.log('Post likes updated in elastic');

	if (
		post.likes &&
		(post.likes & (post.likes - 1n)) === 0n &&
		(post.likes < -9 || post.likes > 9)
	) {
		const slug = bigintToBase58(postId);
		await sendNotification(
			{
				recipient: post.author,
				title: `Your post hit ${post.likes} likes!`,
				href: `/${slug}`,
				id: `${post.id}-${post.likes}`,
				user: post.author,
				body: `Head over to /${slug} to check it out!`,
				// icon: { type: 'varchar', minLength: 5, maxLength: 50 },
			},
			db,
		);
	}

	return updatedPost.likes;
});
