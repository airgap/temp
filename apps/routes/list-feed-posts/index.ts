import { handleListFeedPosts } from '@lyku/handles';
import { sql } from 'kysely';
import { client as pg } from '@lyku/postgres-client';
export default handleListFeedPosts(
	async ({ before, tags, groups, authors, count }, { requester, model }) => {
		let query = pg.selectFrom('posts').selectAll().orderBy('publish', 'desc');

		if (before) {
			query = query.where('publish', '<', new Date(before));
		}

		if (groups) {
			query = query.where((eb) =>
				groups === true
					? eb.exists(
							pg
								.selectFrom('groupMemberships')
								.select('group')
								.where('user', '=', requester)
								.whereRef('group', '=', eb.ref('group')),
						)
					: eb('group', 'in', groups),
			);
		}

		if (tags) {
			query = query.where(
				(eb) =>
					sql`hashtags IS NOT NULL AND EXISTS (
					SELECT 1 FROM hashtags 
					WHERE lowerText IN (${sql.join(tags)}) 
					AND id IN (SELECT unnest(hashtags) FROM posts)
				)`,
			);
		}

		const posts = await query
			.limit(count ?? model.request.properties.count.default)
			.execute();
		console.log('Listing', posts.length, 'posts');
		return posts;
	},
);
