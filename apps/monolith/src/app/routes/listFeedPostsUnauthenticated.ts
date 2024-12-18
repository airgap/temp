import { and, expr, row, Table, Sequence, desc } from 'rethinkdb';
import { monolith, Post } from 'models';

import { useContract } from '../Contract';

export const listFeedPostsUnauthenticated = useContract(
	monolith.listFeedPostsUnauthenticated,
	async ({ before, groups, tags }, { tables, connection }) => {
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		let query: Table<Post> | Sequence<Post> = tables.posts.orderBy(
			desc('published'),
		);
		// .orderBy(desc('published'))
		// .merge((p: Ex<FromSchema<typeof post>>) => ({
		// 	author: tables.users.get(p('authorId')),
		// 	// likes: tables.likes.getAll(post('id'), {index: 'postId'}).count()
		// }));
		const filters: ReturnType<typeof and>[] = [];
		if (before) filters.push(row('postDate').lt(new Date(before)));
		if (groups)
			filters.push(
				and(row.hasFields('groupId'), expr(groups).includes(row('groupId'))),
			);
		if (tags)
			filters.push(
				and(
					row.hasFields('lowerTags'),
					row('lowerTags')
						.filter((r: string[]) => expr(tags).contains(r))
						.limit(1),
				),
			);
		if (filters.length)
			query = query.filter<boolean>(
				filters.length > 1 ? and(...filters) : filters[0],
			);
		const posts = await query.coerceTo('array').run(connection);
		if ('error' in posts) throw { error: posts.error };
		// const authors = await tables.users
		// 	.getAll(posts.map(p => p.authorId))
		// 	.coerceTo('array')
		// 	.run(connection);
		console.log('Listing posts', posts);
		return posts;
	},
);
