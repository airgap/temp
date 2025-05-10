import { handleListFeedPostsUnauthenticated } from '@lyku/handles';
import { client as pg } from '@lyku/postgres-client';
export default handleListFeedPostsUnauthenticated(
	async ({ before, tags, groups, authors, count }, { requester, model }) => {
		let query = pg.selectFrom('posts').selectAll().orderBy('publish', 'desc');

		if (before) {
			query = query.where('publish', '<', new Date(before));
		}

		if (groups) {
			query = query.where((eb) => eb('group', 'in', groups));
		}

		if (tags) {
			query = query.where((eb) =>
				eb.exists(
					pg
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
