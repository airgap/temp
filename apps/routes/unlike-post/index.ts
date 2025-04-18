import { handleUnlikePost } from '@lyku/handles';

export default handleUnlikePost(async (postId, { db, requester, elastic }) => {
	console.log('unliking post');
	console.log('got user id', requester);

	const like = await db
		.selectFrom('likes')
		.where('postId', '=', postId)
		.where('userId', '=', requester)
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

	await db
		.deleteFrom('likes')
		.where('postId', '=', postId)
		.where('userId', '=', requester)
		.execute();

	console.log('Deleted like');

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

	await elastic.update({
		index: 'posts',
		id: postId.toString(),
		script: {
			source: 'ctx._source.likes = (ctx._source.likes ?: 0) - 1',
			lang: 'painless',
		},
	});

	console.log('likee update', authorUpdate);
	console.log('YAY YOU PASS');
	return postUpdate.likes;
});
