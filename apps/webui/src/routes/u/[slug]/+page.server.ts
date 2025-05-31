// import type { PageLoad } from './$types';
import { initRedis } from '../../../initRedis.server';
import { neon, getUsers, getLikesForPosts } from '../../../lib/server';
import { type User } from '@lyku/json-models';
import { parsePossibleBON } from 'from-schema';
import { Err } from '@lyku/helpers';
export const load = async ({ params, fetch, parent }) => {
	const getUserBySlugFromPg = () =>
		db
			.selectFrom('users')
			.selectAll()
			.where('slug', '=', slug.toLocaleLowerCase())
			.executeTakeFirst();
	const { user, redis, pg } = await parent();
	const db = pg;
	const { slug } = params;
	let target: User | null = null;
	let userId = await redis.hget('userIds', slug);
	if (!userId) {
		const target = await getUserBySlugFromPg();
		if (!target) throw new Err(404);
		void redis.hset('users', target.id.toString(), JSON.stringify(target));
		void redis.hset('userIds', slug, target.id.toString());
	}
	if (userId)
		target = await redis.hget('users', userId).then(parsePossibleBON<User>);
	if (!target) {
		if (!target) throw new Err(404);
		// if (!userId) await redis.hset('userIds', slug, target.id.toString());
	}
	const postIds = await redis.zrange(`user:${target}:recentPosts`, 0, 50, {
		rev: true,
		withScores: true,
	});
	const posts = target
		? await db
				.selectFrom('posts')
				.selectAll()
				.where('author', '=', target.id)
				.orderBy('publish', 'desc')
				.execute()
		: [];

	const authors = posts?.length
		? await getUsers(
				db,
				redis,
				posts.map((p) => p.id),
			)
		: [];
	const rawFollows = await db
		.selectFrom('userFollows')
		.select('followee')
		.where('follower', '=', user.id)
		.where(
			'followee',
			'in',
			authors.map((a) => a.id),
		)
		.execute();
	const followVectors = authors.map((a) =>
		rawFollows.some((f) => f.followee === a.id) ? a.id : -a.id,
	);
	const rawLikes = await getLikesForPosts(
		db,
		redis,
		posts.map((p) => p.id),
		user,
	);
	const likeVectors = posts.map((p) =>
		rawLikes.some((l) => l === p.id) ? p.id : -p.id,
	);
	// const likemap = likes.reduce((o,l)=>({...o, [l.postId]}))
	// console.log('OY M8 WE GOT LIKES', )
	return {
		posts,
		users: authors,
		likes: likeVectors,
		follows: followVectors,
		target,
	};
};
