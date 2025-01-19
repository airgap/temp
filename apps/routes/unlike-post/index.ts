import { handleUnlikePost } from '@lyku/handles';

export default handleUnlikePost(async (postId, { db, requester }) => {
	console.log('unliking post');
	const likeId = `${requester}~${postId}`;
	console.log('got user id', requester);

	const like = await db
		.selectFrom('likes')
		.where('id', '=', likeId)
		.executeTakeFirst();

	if (!like) throw 'You have not liked that post';

	console.log('like', like);
	console.log('Decrementing likes');

	const postUpdate = await db
		.updateTable('posts')
		.where('id', '=', postId)
		.set((eb) => ({
			likes: eb('likes', '-', 1n),
		}))
		.returning(['likes'])
		.executeTakeFirstOrThrow();

	console.log('Updated post', postUpdate);
	console.log('Deleting like');

	await db.deleteFrom('likes').where('id', '=', likeId).execute();

	console.log('Deleted like');

	const userUpdate = await db
		.updateTable('users')
		.where('id', '=', requester)
		.set((eb) => ({
			points: eb('points', '-', 1n),
		}))
		.returning(['points'])
		.executeTakeFirstOrThrow();

	const post = await db
		.selectFrom('posts')
		.where('id', '=', postId)
		.select(['author'])
		.executeTakeFirstOrThrow();

	const authorUpdate = await db
		.updateTable('users')
		.where('id', '=', post.author)
		.set((eb) => ({
			points: eb('points', '-', 1n),
		}))
		.returning(['points'])
		.executeTakeFirstOrThrow();

	console.log('Liker update', userUpdate, 'likee update', authorUpdate);
	console.log('YAY YOU PASS');
	return postUpdate.likes;
});
