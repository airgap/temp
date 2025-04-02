import { handleListUserPosts } from '@lyku/handles';
import { Err } from '@lyku/helpers';

export default handleListUserPosts(
	async ({ before, user }, { db, requester }) => {
		// TODO: implement <groups> and <tags> filters
		// let query = tables.posts.orderBy(desc('publish')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		// const author = isUuid(user) ? user : tables.users.get(user);
		const author =
			typeof user === 'string'
				? await db
						.selectFrom('users')
						.where('slug', '=', user.toLocaleLowerCase())
						.select('id')
						.executeTakeFirst()
						.then((r) => r?.id)
				: user;
		if (!author) throw new Err(404, 'User not found');
		const query = db
			.selectFrom('posts')
			.selectAll()
			.where('author', '=', author)
			.where('publish', '<', new Date())
			.orderBy('publish', 'desc');
		const filtered = before ? query.where('id', '<', before) : query;
		const final = filtered.limit(20);
		const res = await final.execute();
		console.log('Listing', res.length, 'posts');
		return res;
	},
);
