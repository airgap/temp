import { handleListHotPosts } from '@lyku/handles';
import { Like } from '@lyku/json-models';
import { sql } from 'kysely';

export default handleListHotPosts(
	async ({ before, limit }, { db, requester }) => {
		console.log('Listing hot posts');
		// let query = tables.posts.orderBy(desc('publish')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		// Get base posts query
		let postsQuery = db.selectFrom('posts').selectAll();

		const now = new Date();
		const b = before && before < now ? before : now;
		postsQuery = postsQuery.where('publish', '<', b);

		console.log('Posts query:', postsQuery.compile().sql);

		const refinedPostsQuery = postsQuery
			.select((eb) => [
				sql<number>`(${eb.ref('likes')} + ${eb.ref(
					'loves',
				)} * 10.0) / NULLIF(${sql<number>`EXTRACT(EPOCH FROM (NOW() - publish))`.as(
					'age',
				)}, 0)`.as('hotness'),
			])
			.orderBy('hotness', 'desc')
			.limit(limit ?? 20);
		console.log('Refined posts query:', refinedPostsQuery.compile().sql);

		const posts = await refinedPostsQuery.execute();

		console.log('Posts:', posts.length);

		// Get unique author IDs
		const authorIds = [...new Set(posts.map((p) => p.author))];
		console.log('Author IDs:', authorIds);

		// Get authors in single query
		const authors = authorIds.length
			? await db
					.selectFrom('users')
					.where('id', 'in', authorIds)
					.selectAll()
					.execute()
			: [];

		console.log('Authors:', authors.length);

		// Get likes if authenticated
		const likes: Like[] =
			requester && posts.length
				? await db
						.selectFrom('likes')
						.where('userId', '=', requester)
						.where(
							'postId',
							'in',
							posts.map((p) => p.id),
						)
						.select('postId')
						.execute()
				: [];

		console.log('Likes:', likes.length);

		const set = new Set(likes.map((like) => like.postId));

		// Build response with normalized data
		const response = {
			posts,
			authors,
			likes: posts.map(({ id }) => (set.has(id) ? id : -id)),
		};

		console.log('Hot posts:', posts.length);
		return response;
	},
);
