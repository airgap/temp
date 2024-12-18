import { FromSchema } from 'from-schema';
import { Ex, add, and, desc, div, mul, now, row, sub } from 'rethinkdb';

import { post, monolith } from 'models';
import { useContract } from '../Contract';
import { getUserId } from '../getUserId';
import { isUuid } from '../isSessionId';

// const hasGroupId = row.hasFields('groupId');
// const hasntGroupId = hasGroupId.not();

export const listHotPosts = useContract(
	monolith.listHotPosts,
	async ({ before, limit }, { tables, connection }, { msg }) => {
		console.log('Listing hot posts');
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		let query = tables.posts
			.orderBy(desc('published'))
			.merge((p: Ex<FromSchema<typeof post>>) => ({
				author: tables.users.get(p('authorId')),
				// likes: tables.likes.getAll(post('id'), {index: 'postId'}).count()
			}));
		const filters: ReturnType<typeof and>[] = [];
		if (before) filters.push(row('postDate').lt(new Date(before)));
		filters.push(row('published').ne(false));
		if (filters.length)
			query = query.filter<false>(
				filters.length > 1 ? and(...filters) : filters[0],
			);
		query = query
			.merge((p: Ex<FromSchema<typeof post>>) => ({
				hotness: div(
					add(p('likes').default(0), mul(p('loves').default(0), 10)),
					sub(now(), p('published')),
				),
			}))
			.orderBy(desc('hotness'))
			.limit(limit ?? 20);
		if (isUuid(msg.headers.sessionid)) {
			// console.log('Session id!!!!!!!!', msg.headers.sessionid, typeof msg.headers.sessionid);
			const userId = await getUserId(msg, tables, connection);
			query = query.merge((p: Ex<FromSchema<typeof post>>) => ({
				author: tables.users.get(p('authorId')),
				likedByYou: tables.likes
					.getAll([userId, p('id')], {
						index: 'bond',
					})
					.limit(1)(0)('id')
					.default(false),
				// likes: tables.likes.getAll(post('id'), {index: 'postId'}).count()
			}));
		}
		const res = await query.run(connection);
		console.log('Hot posts:', res.length);
		return res;
	},
);
