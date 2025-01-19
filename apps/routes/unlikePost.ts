import { monolith } from 'models';
import { and, row } from 'rethinkdb';

import { useContract } from '../Contract';

export const unlikePost = useContract(
	monolith.unlikePost,
	async (postId, { tables, connection }, { userId }) => {
		console.log('unliking post');
		// const session = tables.sessions.get(msg.headers.sessionid);
		// const userId = session('userId');
		const likeId = `${userId}~${postId}`;
		console.log('got user id', userId);
		const post = tables.posts.get(postId);
		const like = await and(
			tables.posts.get(postId),
			tables.likes.get(likeId)
		).run(connection);
		console.log('like', like);
		if (!like) throw 'You have not liked that post';
		console.log('Decrementing likes');
		const postUpdate = await tables.posts
			.get(postId)
			.update(
				{ likes: row('likes').sub(1) },
				{
					returnChanges: true,
				}
			)('changes')(0)('new_val')
			.run(connection);
		console.log('Updated post', postUpdate);
		console.log('Deleting like');
		await tables.likes.get(likeId).delete().run(connection);
		console.log('Deleted like');
		const get = tables.users.get(userId);
		const userUpdate = get.update((user) => ({
			points: user('points').sub(1),
		}));
		const upd = await userUpdate.run(connection);
		const author = tables.users.get(post('authorId'));
		const upd2 = await author
			.update((user) => ({
				points: user('points').sub(1),
			}))
			.run(connection);
		console.log('Liker update', upd, 'likee update', upd2);
		console.log('YAY YOU PASS');
		return postUpdate.likes;
	}
);
