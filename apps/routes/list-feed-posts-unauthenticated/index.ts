import { handleListFeedPostsUnauthenticated } from '@lyku/handles';

export default handleListFeedPostsUnauthenticated(
	async (
		{ before, tags, groups, authors, count },
		{ db, requester, model },
	) => {
		let query = db.selectFrom('posts').selectAll().orderBy('published', 'desc');

		if (before) {
			query = query.where('published', '<', new Date(before));
		}

		if (groups) {
			query = query.where((eb) => eb('group', 'in', groups));
		}

		if (tags) {
			query = query.where((eb) =>
				eb.exists(
					db
						.selectFrom('hashtags')
						.select('id')
						.where('lowerText', 'in', tags)
						.whereRef('id', 'in', eb.ref('hashtags')),
				),
			);
		}

		const posts = await query
			.limit(count ?? model.request.properties.count.default)
			.execute();
		console.log('Listing', posts.length, 'posts');
		return posts;
	},
);
