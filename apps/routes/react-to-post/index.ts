import { handleReactToPost } from '@lyku/handles';
import { bigintToBase58, Err, reactionWorth } from '@lyku/helpers';

import { sql } from 'kysely';
import { grantPointsToUser, sendNotification } from '@lyku/route-helpers';
export default handleReactToPost(
	async ({ postId, type }, { requester, db, clickhouse, now }) => {
		const post = await db
			.selectFrom('posts')
			.selectAll()
			.where('id', '=', postId)
			.executeTakeFirst();

		if (!post) throw new Err(404, "Post doesn't exist");

		if (post.author === requester) {
			throw new Err(403, 'You cannot like your own post');
		}
		await clickhouse.insert({
			table: 'user_post_reactions_toilet',
			values: [
				{
					userId: requester,
					postId: postId,
					reaction: type,
					created: now,
					updated: now,
				},
			],
		});

		// Add point to recipient
		if (post.author !== requester) {
			await clickhouse.insert({
				table: 'user_point_grants_toilet',
				values: [
					{
						userId: post.author,
						reason: 'post_reacted',
						key: `${requester}-${post.id}`,
						points: reactionWorth(type),
						created: now,
						updated: now,
					},
				],
			});
			// await grantPointsToUser(1, post.author, db);
		}
		// console.log('Updating post likes in elastic');
		// const [year, month] = post.publish.toISOString().split('T')[0].split('-');
		// const index = `posts-${year}-${month}`;
		// await elastic.update({
		// 	index,
		// 	id: postId.toString(),
		// 	script: {
		// 		source: `ctx._source.likes = (ctx._source.likes != null ? ctx._source.likes + 1 : 1);`,
		// 		lang: 'painless',
		// 	},
		// });
		// console.log('Post likes updated in elastic');

		// if (
		// 	post.likes &&
		// 	(post.likes & (post.likes - 1n)) === 0n &&
		// 	(post.likes < -9 || post.likes > 9)
		// ) {
		// 	const slug = bigintToBase58(postId);
		// 	await sendNotification(
		// 		{
		// 			recipient: post.author,
		// 			title: `Your post hit ${post.likes} likes!`,
		// 			href: `/${slug}`,
		// 			id: `${post.id}-${post.likes}`,
		// 			user: post.author,
		// 			body: `Head over to /${slug} to check it out!`,
		// 			// icon: { type: 'varchar', minLength: 5, maxLength: 50 },
		// 		},
		// 		db,
		// 	);
		// }

		// return updatedPost.likes;
	},
);
