// import { ZSTDDecoder } from 'zstddec';
// import brotworst from 'compress-brotli';
// import { zstdDecompressSync } from 'node:zlib';
import { client as redis } from '@lyku/redis-client';
import { client as pg } from '@lyku/postgres-client';
import { FileDoc, Post, Reaction, User } from '@lyku/json-models';
import { bondIds } from '@lyku/helpers';
import { parsePossibleBON } from 'from-schema';
import { handleListHotPosts } from '@lyku/handles';
import { defaultLogger } from '@lyku/logger';

// const decompressor = brotworst();
export default handleListHotPosts(async ({ page }, { requester }) => {
	console.log(
		'Listing',
		typeof page === 'number' ? `page ${page} of ` : 'all',
		'hot posts',
	);
	// let query = tables.posts.orderBy(desc('publish')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
	// Get base posts query
	// let postsQuery = pg.selectFrom('posts').selectAll();

	// const now = new Date();
	// const b = before && before < now ? before : now;
	// postsQuery = postsQuery.where('publish', '<', b);

	// console.log('Posts query:', postsQuery.compile().sql);

	// const refinedPostsQuery = postsQuery
	// 	.select((eb) => [
	// 		sql<number>`(${eb.ref('likes')} + ${eb.ref(
	// 			'loves',
	// 		)} * 10.0) / NULLIF(${sql<number>`EXTRACT(EPOCH FROM (NOW() - publish))`.as(
	// 			'age',
	// 		)}, 0)`.as('hotness'),
	// 	])
	// 	.orderBy('hotness', 'desc')
	// 	.limit(limit ?? 20);
	// console.log('Refined posts query:', refinedPostsQuery.compile().sql);

	// const posts = await refinedPostsQuery.execute();
	const pagestr = page ? `:page:${page}` : '';
	const posts = (await redis
		.get(`hot_posts${pagestr}`)
		.then(parsePossibleBON)) as Post[] | null;

	console.log('Posts:', posts?.length);
	if (!posts) {
		throw 'No posts found';
	}
	// Get unique author IDs
	const authorIds = [...new Set(posts.map((p) => p.author))];
	console.log('Author IDs:', authorIds);

	const fileIds = posts.flatMap((p) => p.attachments);

	// Run all database queries in parallel
	console.log('Starting parallel database queries...');
	const dbStartTime = Date.now();

	const [authors, reactions, followees, friendships, files] =
		(await Promise.all([
			// Get authors
			authorIds.length
				? pg
						.selectFrom('users')
						.where('id', 'in', authorIds)
						.selectAll()
						.execute()
				: Promise.resolve([]),

			// Get reactions if authenticated
			requester && posts.length
				? pg
						.selectFrom('reactions')
						.where('userId', '=', requester)
						.where(
							'postId',
							'in',
							posts.map((p) => p.id),
						)
						.select(['postId', 'type'])
						.execute()
				: Promise.resolve([]),

			// Get followees if authenticated
			requester && authorIds.length
				? pg
						.selectFrom('userFollows')
						.select(['followee'])
						.where('followee', 'in', authorIds)
						.where('follower', '=', requester)
						.execute()
				: Promise.resolve([]),

			// Get friendships if authenticated
			requester && authorIds.length
				? pg
						.selectFrom('friendships')
						.select('users')
						.where(
							'id',
							'in',
							authorIds.map((a) => bondIds(a, requester)),
						)
						.execute()
				: Promise.resolve([]),
			fileIds.length
				? pg
						.selectFrom('files')
						.selectAll()
						.where('id', 'in', fileIds)
						.execute()
				: [],
		])) as [
			User[],
			{ postId: bigint; type: string }[],
			{ followee: bigint }[],
			User[],
			FileDoc[],
		];

	console.log(`Database queries took ${Date.now() - dbStartTime}ms`);
	console.log('Authors:', authors.length);
	console.log('Reactions:', reactions.length);
	console.log('Followees:', followees.length);
	console.log('Files:', files.length);

	const map = new Map(reactions.map((r: Reaction) => [r.postId, r.type]));
	console.log('Responding');
	// Build response with normalized data
	const response = {
		posts,
		authors,
		reactions: posts.map(({ id }) => (map.has(id) ? map.get(id) : '')),
		followees: followees.map((f) => f.followee),
		followers: [],
		friends: friendships.map((f) =>
			f.users[0] === requester ? f.users[1] : f.users[0],
		),
		files,
	};

	console.log('Hot posts:', posts.length);
	defaultLogger.info('Hot response', response);
	return response;
});
