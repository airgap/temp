import { handleLikePost } from '@lyku/handles';
import { sql } from 'kysely';

export const likePost = handleLikePost(async (postId, { db, requester }) => {
	const likeId = `${requester}~${postId}`;

	// Check if post exists and isn't already liked by this user
	const existingLike = await db
		.selectFrom('likes')
		.where('id', '=', likeId)
		.executeTakeFirst();

	const post = await db
		.selectFrom('posts')
		.where('id', '=', postId)
		.executeTakeFirst();

	if (!post || existingLike || post.author === requester) {
		throw "Post doesn't exist or is already liked";
	}

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
		.executeTakeFirst();

	// Add points to both users
	await db
		.updateTable('users')
		.set((eb) => ({
			points: eb('points', '+', 1),
		}))
		.where('id', 'in', [requester, post.author])
		.execute();

	return updatedPost?.likes ?? 0;
});
