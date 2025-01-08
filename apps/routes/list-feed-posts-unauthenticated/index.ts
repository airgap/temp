import { handleListFeedPosts } from '@lyku/handles';

export default handleListFeedPosts(
	async ({ before, tags, groups, authors, count }, { db, requester }) => {
		let query = db.selectFrom('posts').selectAll().orderBy('published', 'desc');

		if (before) {
			query = query.where('published', '<', new Date(before));
		}

		if (groups) {
			query = query.where((eb) => eb('group', 'in', groups));
		}

		if (tags) {
			query = query.where((eb) =>
				eb.and([
					eb.ref('hashtags').$notNull(),
					eb.exists(
						db
							.selectFrom('hashtags')
							.select('id')
							.where('lowerText', 'in', tags)
							.whereRef('id', '=', eb.ref('hashtag'))
					),
				])
			);
		}

		const posts = await query.limit(count).execute();
		console.log('Listing', posts.length, 'posts');
		return posts;
	}
);
