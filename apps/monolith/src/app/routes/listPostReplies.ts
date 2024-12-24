import { Ex, and, desc, expr, row, And } from 'rethinkdb';

import { useContract } from '../Contract';
import { monolith, Post } from 'models';

export const listPostReplies = useContract(
	monolith.listPostReplies,
	async ({ id, before, tags }, { tables, connection }) => {
		let query = tables.posts
			.getAll(id, { index: 'replyTo' })
			.orderBy(desc('published'));
		const filters: Parameters<And> = [];
		if (before) filters.push(row('postDate').lt(new Date(before)));
		if (tags)
			filters.push((ro: Ex<Post>) =>
				and(
					ro.hasFields('lowerTags'),
					row('lowerTags')
						.filter((r: string) => expr(tags).contains(r))
						.limit(1)
				)
			);
		query = query.filter<false>(and(...filters));
		query = query.limit(20);

		// query = query.merge((p: Ex<FromSchema<typeof post>>) => ({
		// 	author: tables.users.get(p('authorId')),
		// 	likedByYou: tables.likes
		// 		.getAll([userId, p('id')], {
		// 			index: 'bond',
		// 		})
		// 		.limit(1)(0)('id')
		// 		.default(false),
		// 	// likes: tables.likes.getAll(post('id'), {index: 'postId'}).count()
		// }));
		const res = await query.coerceTo('array').run(connection);
		console.log('Listing', res.length, 'posts');
		return { posts: res as Post[] };
	}
);
