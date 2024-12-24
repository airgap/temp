import { Ex, and, desc, expr, or, row, Sequence } from 'rethinkdb';
import { Post, monolith } from 'models';

import { useContract } from '../Contract';
import { ActualTables } from '../types/ActualTables';

type FilterMap = Partial<
	Record<
		string,
		(
			userIdQuery: Ex<string> | string,
			tables: ActualTables
		) => (row: Ex<Post>) => Ex<boolean>
	>
>;
const filterMap: FilterMap = {
	users: (userId, tables) => (row) =>
		and(
			row.hasFields('groupId').not(),
			or(
				row('authorId').eq(userId),
				tables.userFollows.getAll([userId, row('authorId')], {
					index: 'bond',
				})
			)
		),
	groups: (userId, tables) => (row) =>
		and(
			row.hasFields('groupId'),
			tables.groupMemberships.getAll([userId, row('groupId') as Ex<string>], {
				index: 'bond',
			})
		),
	all: () => () => and(expr(true), expr(true)), // god help me
};

export const isValidKey = <T extends object>(
	key: keyof T | undefined,
	obj: T
): key is keyof T => {
	return Boolean(key && key in obj);
};

export const listFeedPosts = useContract(
	monolith.listFeedPosts,
	async (
		{ before, tags, groups, filter },
		{ tables, connection },
		{ userId }
	) => {
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		let query: Sequence<Post> = tables.posts.orderBy(desc('published'));
		const filters: (Ex<boolean> | ((ro: Ex<Post>) => Ex<boolean>))[] = [];
		if (before) filters.push(row('postDate').lt(new Date(before)));
		if (isValidKey(filter, filterMap)) {
			const a = filterMap[filter];
			if (a) filters.push(a(userId, tables));
		}
		if (groups)
			filters.push((ro: Ex<Post>) =>
				and(
					ro.hasFields('groupId'),
					(groups === true
						? tables.groupMemberships.getAll(userId, {
								index: 'userId',
						  })
						: expr(groups)
					).includes(row('groupId'))
				)
			);
		if (tags)
			filters.push((ro: Ex<Post>) =>
				and(
					ro.hasFields('lowerTags'),
					row('lowerTags')
						.filter((r: string) => expr(tags).contains(r))
						.limit(1)
				)
			);
		if (filters.length)
			query = query.filter<boolean>(
				filters.length > 1 ? and(...filters) : filters[0]
			);
		const posts = await query.limit(20).coerceTo('array').run(connection);
		console.log('Listing', posts.length, 'posts');
		return posts;
	}
);
