import { handleListFeedPosts } from '@lyku/handles';
import { sql } from 'kysely';

export default handleListFeedPosts(
	async (
		{ before, tags, groups, authors, count },
		{ db, requester, model },
	) => {
		let query = db.selectFrom('posts').selectAll().orderBy('published', 'desc');

		if (before) {
			query = query.where('published', '<', new Date(before));
		}

		if (groups) {
			query = query.where((eb) =>
				groups === true
					? eb.exists(
							db
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
