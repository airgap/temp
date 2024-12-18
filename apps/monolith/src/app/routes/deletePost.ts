import { monolith } from 'models';
import { useContract } from '../Contract';

export const deletePost = useContract(
	monolith.deletePost,
	async (id, { tables, connection }, { userId }, strings) => {
		const post = tables.posts.get(id);
		const authRes = await post
			.and(post('authorId').eq(userId))
			.branch(post.delete(), {
				error: strings.noPostByYou,
			})
			.run(connection);

		console.log('ViewPost finalization authorized');

		if ('error' in authRes) throw new Error('404');
	},
);
