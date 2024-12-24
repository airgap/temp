import { FromSchema } from 'from-schema';
import { Ex, desc } from 'rethinkdb';
import { post, uuid, monolith } from 'models';

import { useContract } from '../Contract';
import { getUserId } from '../getUserId';

export const listUserPosts = useContract(
	monolith.listUserPosts,
	async ({ before, user }, { tables, connection }, { msg }) => {
		// TODO: implement <groups> and <tags> filters
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		// const author = isUuid(user) ? user : tables.users.get(user);
		const author = await tables.users
			.getAll(user, { index: 'username' })(0)('id')
			.run(connection);
		let query = tables.posts
			.getAll(author, {
				index: 'authorId',
			})
			.orderBy(desc('published'));
		let userId: FromSchema<typeof uuid>;
		if (msg.headers.authorization) {
			userId = await getUserId(msg, tables, connection);
			query = query.merge((p: Ex<FromSchema<typeof post>>) => ({
				author,
				likedByYou: tables.likes
					.getAll([userId, p('id')], {
						index: 'bond',
					})
					.limit(1)(0)('id')
					.default(false),
				// likes: tables.likes.getAll(post('id'), {index: 'postId'}).count()
			}));
		}
		const filtered = before
			? query.filter<true>((d) => d('published').lt(new Date(before)))
			: query;

		const merged = filtered.merge((p: Ex<FromSchema<typeof post>>) => ({
			author: tables.users.get(p('authorId')),
			...(userId
				? {
						likedByYou: tables.likes
							.getAll([userId, p('id')], {
								index: 'bond',
							})
							.limit(1)(0)('id')
							.default(false),
				  }
				: {}),
			// likes: tables.likes.getAll(post('id'), {index: 'postId'}).count()
		}));
		const final = merged.limit(20).coerceTo('array');
		const res = await final.run(connection);
		console.log('Listing', res.length, 'posts');
		return res;
	}
);
