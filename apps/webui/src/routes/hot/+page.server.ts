// import type { PageLoad } from './$types';
import { api, setFetch } from 'monolith-ts-api';
import { neon } from '../../lib/server/db.server';
import { sql } from 'kysely';

export const load = async ({ params, fetch }: any) => {
	const db = neon();
	const posts = await db
		.selectFrom('posts')
		.selectAll()
		.orderBy(
			sql`(likes / (EXTRACT(EPOCH FROM (NOW() - "publish")) / 3600))`,
			'desc',
		)
		.limit(50)
		.execute()
		.then((ps) =>
			ps.map((p) => ({
				...p,
				attachments: p.attachments?.map((a) => BigInt(a)),
			})),
		);

	const authors = await db
		.selectFrom('users')
		.where('id', 'in', [...new Set(posts.map((p) => p.author))])
		.selectAll()
		.execute();
	const likes = await db
		.selectFrom('likes')
		.where(
			'postId',
			'in',
			posts.map((p) => p.id),
		)
		.selectAll()
		.execute();
	// const likemap = likes.reduce((o,l)=>({...o, [l.postId]}))
	// console.log('OY M8 WE GOT LIKES', )
	return {
		posts,
		users: authors,
		likes: posts.map((p) =>
			likes.some((l) => l.postId === p.id) ? p.id : -p.id,
		),
	};
};
