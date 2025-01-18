import { handleListUserPosts } from '@lyku/handles';

export default handleListUserPosts(
	async ({ before, user }, { db, requester }) => {
		// TODO: implement <groups> and <tags> filters
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		// const author = isUuid(user) ? user : tables.users.get(user);
		const author =
			typeof user === 'string'
				? await db
						.selectFrom('users')
						.where('username', '=', user)
						.select('id')
						.executeTakeFirstOrThrow()
						.then((r) => r.id)
				: user;
		const query = db
			.selectFrom('posts')
			.selectAll()
			.where('author', '=', author)
			.orderBy('published', 'desc');
		const filtered = before ? query.where('id', '<', before) : query;
		const final = filtered.limit(20);
		const res = await final.execute();
		console.log('Listing', res.length, 'posts');
		return res;
	}
);
