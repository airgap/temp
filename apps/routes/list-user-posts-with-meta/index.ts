import { handleListUserPostsWithMeta } from '@lyku/handles';
import { bondIds, Err } from '@lyku/helpers';
import { File, Reaction, User } from '@lyku/json-models';
import { client as pg } from '@lyku/postgres-client';
import { client as redis } from '@lyku/redis-client';
import { pack, unpack } from 'msgpackr';

export default handleListUserPostsWithMeta(
	async ({ before, user }, { requester }) => {
		// TODO: implement <groups> and <tags> filters
		// let query = tables.posts.orderBy(desc('publish')).eqJoin('authorId', tables.users).map(row => ({post: row('left'), author: row('right')}));
		// const author = isUuid(user) ? user : tables.users.get(user);
		// const uid = typeof user === 'bigint' ? user : await redis.get(`user`)
		let uid: bigint | null = null;
		if (typeof user === 'string') {
			console.log('Getting user id from redis');
			const cachedId = await redis.get(`user_ids:${user}`);
			console.log('User id from redis:', cachedId);
			if (cachedId) uid = BigInt(cachedId);
			else {
				console.log('Getting user id from pg');
				const res = await pg
					.selectFrom('users')
					.where('slug', '=', user.toLocaleLowerCase())
					.select('id')
					.executeTakeFirst()
					.then((r) => r?.id);
				console.log('User id from pg:', res);
				if (res) {
					uid = res;
					await redis.set(`user_ids:${user}`, uid.toString());
				} else {
					throw new Err(404, 'User not found');
				}
			}
		}
		if (!uid) throw new Err(404);
		console.log('Getting user from redis');
		let author = await redis
			.getBuffer(`user:${uid}`)
			.then((u) => u && unpack(u));
		console.log('User from redis:', author);
		if (!author) {
			console.log('Getting user from pg');
			author = await pg
				.selectFrom('users')
				.where('id', '=', uid)
				.selectAll()
				.executeTakeFirst()
				.then((r) => r?.id);
			console.log('User from pg:', author);
			if (author) await redis.set(`user:${uid}`, pack(author));
		}
		if (!author) throw new Err(404, 'User not found');
		const query = pg
			.selectFrom('posts')
			.selectAll()
			.where('author', '=', uid)
			.where('publish', '<', new Date())
			.orderBy('publish', 'desc');
		const filtered = before ? query.where('id', '<', before) : query;
		const final = filtered.limit(20);
		const posts = await final.execute();
		console.log('Posts:', posts);

		// Get unique author IDs
		const authorIds = [...new Set(posts.map((p) => p.author))];
		console.log('Author IDs:', authorIds);

		const fileIds = posts.flatMap((p) => p.attachments ?? []);

		// Run all database queries in parallel
		console.log('Starting parallel database queries...');
		const dbStartTime = Date.now();

		const [users, reactions, followees, friendships, files] =
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
							.selectAll()
							// .select(['postId', 'type'])
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
					: Promise.resolve([]),
			])) as [User[], Reaction[], { followee: bigint }[], User[], File[]];

		console.log(`Database queries took ${Date.now() - dbStartTime}ms`);
		console.log('Authors:', users.length);
		console.log('Reactions:', reactions.length);
		console.log('Followees:', followees.length);
		console.log('Responding');
		if (!users.length) users.push(author);
		// Build response with normalized data
		const response = {
			posts,
			users,
			reactions,
			followees: followees.map((f) => f.followee),
			followers: [],
			friendships: friendships,
			target: uid,
			threads: posts.map((p) => ({ focus: p.id })),
			files,
		};
		console.log('Listing', posts.length, 'posts');
		return response;
	},
);
