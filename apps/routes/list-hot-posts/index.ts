import { handleListHotPosts } from '@lyku/handles';
import { Like } from '@lyku/json-models';
import { sql } from 'kysely';

export default handleListHotPosts(
	async ({ before, limit }, { db, requester }) => {
		console.log('Listing hot posts');
		// let query = tables.posts.orderBy(desc('published')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		// Get base posts query
		const postsQuery = db.selectFrom('posts').selectAll();

		// Apply before filter if specified
		if (before) {
			postsQuery.where('published', '<', new Date(before));
		}

		// Calculate hotness and get posts
		const posts = await postsQuery
			.select((eb) => [
				sql<number>`(${eb.ref('likes')} + ${eb.ref(
					'loves'
				)} * 10.0) / NULLIF(${sql<number>`EXTRACT(EPOCH FROM (NOW() - published))`.as(
					'age'
				)}, 0)`.as('hotness'),
			])
			.orderBy('hotness', 'desc')
			.limit(limit ?? 20)
			.execute();

		// Get unique author IDs
		const authorIds = [...new Set(posts.map((p) => p.author))];

		// Get authors in single query
		const authors = await db
			.selectFrom('users')
			.where('id', 'in', authorIds)
			.selectAll()
			.execute();

		// Get likes if authenticated
		const likes: Like[] = requester
			? await db
					.selectFrom('likes')
					.where('userId', '=', requester)
					.where(
						'postId',
						'in',
						posts.map((p) => p.id)
					)
					.selectAll()
					.execute()
			: [];

		// Build response with normalized data
		const response = {
			posts,
			authors,
			likes,
		};

		console.log('Hot posts:', posts.length);
		return response;
	}
);
