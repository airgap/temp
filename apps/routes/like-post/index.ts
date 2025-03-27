import { handleLikePost } from '@lyku/handles';
import { Err } from '@lyku/helpers';

import { sql } from 'kysely';
export default handleLikePost(async (postId, { requester, db }) => {
	const likeId = `${requester}~${postId}`;

	// Check if post exists and isn't already liked by this user
	const existingLike = await db
		.selectFrom('likes')
		.where('id', '=', likeId)
		.executeTakeFirst();

	if (existingLike) throw new Err(409, 'Post already liked');

	const post = await db
		.selectFrom('posts')
		.selectAll()
		.where('id', '=', postId)
		.executeTakeFirst();

	if (!post) throw new Err(404, "Post doesn't exist");

	// if (post.author === requester) {
	// 	throw new Err(403, 'You cannot like your own post');
	// }

	// Insert the like
	await db
		.insertInto('likes')
		.values({
			id: likeId,
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

	// Add points to both users
	if (post.author !== requester)
		await db
			.updateTable('users')
			.set((eb) => ({
				points: eb('points', '+', 1n),
			}))
			.where('id', 'in', [requester, post.author])
			.executeTakeFirstOrThrow();

	return updatedPost.likes;
});
